// Import React and packages
import React ,{useState, useEffect} from "react";
import Modal from "react-modal";

// Import web3
import Web3 from 'web3';

// Import contract
import FundraiserContract from "./contracts/Fundraiser.json";

/* ---------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------- */

//Component
const FundraiserCard = (props) => {
	//Initializing states
	const [name, setFundraiserName] = useState(null);
	const [url, setFundraiserURL] = useState(null);
	const [imageURL, setimageURL] = useState(null);
	const [description, setFundraiserDescription] = useState(null);
	const [beneficiary, setFundraiserBeneficiary] = useState(null);
	const [custodian, setCustodian] = useState(null);
	const [contract, setContract] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [web3, setWeb3] = useState(null);
	const [donation, setDonation] = useState(null);
	const [totalDonations, setTotalDonations] = useState(null);
	const [exchangeRate, setExchangeRate] = useState(null);

	// fundraiser address from prop
	const fundraiser = props.fundraiser;

	// Loading web3
	const loadWeb3 = async () => {
    	if (window.ethereum) {
      	window.web3 = new Web3(window.ethereum)
      	await window.ethereum.enable()
    	}
    	else if (window.web3) {
      	window.web3 = new Web3(window.web3.currentProvider)
    	}
    	else {
      	window.alert("Non-Ethereum browser detected! Try Metamask.")
    	}
    }


    // Getting exchnage rate from cryptocompare API
    const getExchangeRate = async() => {
    	//Exchange rate
  		const cc = require('cryptocompare');
  		// calculate the exchange rate here
		const exchangeRate = await cc.price('ETH', ['TND'])
		// pass in the coin you want to check and the currency
		setExchangeRate(exchangeRate.TND)
    }
    

    // Initializing web3 and fundraiser data
    const init = async (fundraiser) => {
    try {
    	//Load web3
    	loadWeb3();
    	const web3 = window.web3
    	setWeb3(web3)

    	//Load fundraiser contract
      	const fund = fundraiser
      	const networkId = await web3.eth.net.getId();
      	const deployedNetwork = FundraiserContract.networks[networkId];
      	const accounts = await web3.eth.getAccounts();
      	const instance = new web3.eth.Contract(
        	FundraiserContract.abi,
        	fund
      	);
      	setContract(instance)
      	setAccounts(accounts)

      	//Loading Fundraiser informations from contract
    	const fundraiserName = await instance.methods.name().call();
    	setFundraiserName(fundraiserName);
    	const fundraiserURL = await instance.methods.url().call();
    	setFundraiserURL(fundraiserURL);
    	const fundraiserImageURL = await instance.methods.imageURL().call();
    	setimageURL(fundraiserImageURL);
    	const fundraiserDescription = await instance.methods.description().call();
    	setFundraiserDescription(fundraiserDescription);
    	const fundraiserBeneficiary = await instance.methods.beneficiary().call();
    	setFundraiserBeneficiary(fundraiserBeneficiary);
    	const totalDonationsWei = await instance.methods.totalDonations().call();
    	setTotalDonations(web3.utils.fromWei(totalDonationsWei,"ether"));

    	//Getting live exchange rate
    	getExchangeRate();
    }catch(err){
    	//Handle error
    	console.error(err);
    	}
    }
    	
    //Effect hook
    useEffect(() => {
    	if (fundraiser){
    		init(fundraiser);	
    	}
    },[fundraiser]);



    //Modal for donations
    Modal.setAppElement("#root");
    const [isOpen, setIsOpen] = useState(false);
    function toggleModal() {
    	setIsOpen(!isOpen);
    	getExchangeRate();
  	}




  	//Submissions
  	const handleDonation = async (e) =>{
  		e.preventDefault();
  		try{
  			const gas = await contract.methods.donate().estimateGas()
  			console.log(gas);
  			await contract.methods.donate().send({from: accounts[0], value: web3.utils.toWei(donation,"ether"), gas:2*gas});
			alert("Donation made succesfully");
  		} catch(err){
  			alert("Transaction failed, check console")
  			console.error(err)
  		}
  		const totalDonationsWei = await contract.methods.totalDonations().call();
    	setTotalDonations(web3.utils.fromWei(totalDonationsWei,"ether"));
    	
  	}


    //rendering
    return(
    	<div className="card">
    		<h2 className="card-name">{name}</h2>
    		<img src={imageURL}/>
    		<p className = "card-description">{description}</p>
    		<button className="btn-open-modal" onClick={toggleModal}>Donate</button>

    		<Modal isOpen={isOpen} onRequestClose={toggleModal} contentLabel="Donating" className="donation-modal"
        		overlayClassName="donation-overlay">
        		<div className = "donation-div">
        			<h2 className= "donation-title">Donation</h2>
        			<ul>
        				<li>Fundraiser: {name}</li>
        				<li>Address: {beneficiary}</li>
        				<li>Total Donations: {totalDonations} eth ({exchangeRate * totalDonations} TND)</li>
        			</ul>

        			<form  className = "donation-form" onSubmit={handleDonation}>
        				
        					<label> <p className = "amount-label">Amount</p>
        						<div className="amount-entry">
									<textarea placeholder="0 eth"  className = "amount-textarea" onChange={(e) => setDonation(e.target.value)}/>
									<p className= "donation-exchange">(= {donation * exchangeRate} TND)</p>
								</div>
							</label>
							
        				
        				
        				<div className = "modal-buttons" >
        					<button className="btn-donate" type = 'submit'>Donate </button>
							<button className="btn-black" onClick={toggleModal}>Close</button>
						</div>
        			</form>
        		</div>
      		</Modal>

    	</div>
    	)


}

export default FundraiserCard;