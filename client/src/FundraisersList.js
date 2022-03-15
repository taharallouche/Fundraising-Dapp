//Import React and packages
import React ,{useState, useEffect} from "react";

//Import Components
import FundraiserCard from './FundraiserCard'

//Import Web3
import Web3 from 'web3';

//Import Contract
import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";


/* ---------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------- */

//Component
const FundraisersList = () => {
	// Initialzing states
	const [contract, setContract] = useState(null);
	const [accounts, setAccounts] = useState(null);
	const [web3, setWeb3] = useState(null);
	const [funds, setFunds] = useState([]);


	//Load web3
	const loadWeb3 = async () => {
    	if (window.ethereum) {
      	window.web3 = new Web3(window.ethereum)
      	await window.ethereum.enable()
    	}
    	else if (window.web3) {
      	window.web3 = new Web3(web3.currentProvider);
    	}
    	else {
      	window.alert("Non-Ethereum browser detected! Try Metamask.")
    	}
    }

    // Load contract and data
    const loadBlockchainData = async () => {
    	//Load web3
    	const web3 = window.web3
    	setWeb3(web3)
    	const accounts = await web3.eth.getAccounts()
    	setAccounts(accounts)

    	//Load contract
    	const networkId = await web3.eth.net.getId()
    	const fundraiserFactoryData = FundraiserFactoryContract.networks[networkId]
    	if (fundraiserFactoryData){
      	const instance = new web3.eth.Contract(FundraiserFactoryContract.abi,fundraiserFactoryData.address)
      	setContract(instance);

      	//Load fundraisersList
      	const fundsList = await instance.methods.fundraisers(10,0).call();
      	console.log("funds:",fundsList)
      	setFunds(fundsList);
    	}
    	else {
      	window.alert('FundraiserFactory not deployed to this network')
    	}
    }

   //Effect hook
	useEffect(() => {
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

	
	// Display fundraisers' cards
	const displayFundraisers = () => {
		return funds.map((fundraiser) => {return (
			<FundraiserCard fundraiser={fundraiser}/>)
		})
	}

	//render
	return(
		<div className= "home">
			<h2 className = "component-title">OUR FUNDRAISERS</h2> 
			<div className = "cards">
			{displayFundraisers()}
			</div>
		</div>
		)
}

export default FundraisersList;