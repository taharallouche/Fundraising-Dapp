//Import React and packages
import React ,{useState, useEffect} from "react";

//Import Web3
import Web3 from 'web3';

//Import contract
import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";



/* ---------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------- */

//Component
const NewFundraiser = () => {

	//Defining state and state setters:
	const [name, setFundraiserName] = useState(null);
	const [url, setFundraiserURL] = useState(null);
	const [imageURL, setimageURL] = useState(null);
	const [description, setFundraiserDescription] = useState(null);
	const [beneficiary, setFundraiserBeneficiary] = useState(null);
	const [custodian, setCustodian] = useState(null);
	const [contract, setContract] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [web3, setWeb3] = useState(null);


	//Load web3
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


   //Load contract
   const loadBlockchainData = async () => {
    	const web3 = window.web3
    	setWeb3(web3)
    	const accounts = await web3.eth.getAccounts()
    	setAccounts(accounts)
    	const networkId = await web3.eth.net.getId()

    	const fundraiserFactoryData = FundraiserFactoryContract.networks[networkId]
    	if (fundraiserFactoryData){
      	const instance = new web3.eth.Contract(FundraiserFactoryContract.abi,fundraiserFactoryData.address)
      	setContract(instance);
    	}
    	else {
      	window.alert('FundraiserFactory not deployed to this network')
    	}
    }

  // Effect hook
	useEffect(() => {
		//Initialize web3 and contract
    const init = async () => {
      try {
      	await loadWeb3()
    		await loadBlockchainData()
      } catch (err) {
        alert("Failed to load web3, accounts or network, check console !");
        console.error(err);
      }
    }
    init();
  },[]);


	//Handle submission of new fundraiser
	const handleSubmit = async(e) => {
		e.preventDefault();
		await contract.methods.createFundraiser(name,url,imageURL,description,beneficiary).send({from: accounts[0]});
		alert("New fundraiser created successfully !");
	}



	//render
	return(
		<div className = "new-form">
			<h2 className = "component-title">CREATE NEW FUNDRAISER</h2> 

			<form className="new-form" onSubmit = {handleSubmit} >
					<label className="form-entry"> <p className = "form-label">Name:</p>
						<textarea className = "short-textarea" onChange={(e) => setFundraiserName(e.target.value)}/>
					</label>

					<label className="form-entry"> <p className = "form-label">Website Link:</p>
						<textarea className = "short-textarea" onChange={(e) => setFundraiserURL(e.target.value)}/>
					</label>

					<label className="form-entry"> <p className = "form-label">Image URL:</p>
						<textarea className = "short-textarea" onChange={(e) => setimageURL(e.target.value)}/>
					</label>

					<label className="form-entry"> <p className = "form-label">Description:</p>
						<textarea className="long-textarea" onChange={(e) => setFundraiserDescription(e.target.value)}/>
					</label>

					<label className="form-entry"> <p className = "form-label">Beneficiary:</p>
						<textarea className = "short-textarea" onChange={(e) => setFundraiserBeneficiary(e.target.value)}/>
					</label>

					<button className="btn-submit" type = 'submit'>Submit</button>
					
			</form>
		</div>
		)
}

export default NewFundraiser;