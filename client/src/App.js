//Import React and packages
import React, { useState, useEffect } from "react";
import {BrowserRouter as Router,Routes, Route, NavLink, Navigate} from "react-router-dom";


//Import Components
import NewFundraiser from "./NewFundraiser";
import FundraisersList from "./FundraisersList";
import Home from "./Home";
import Withdraw from "./Withdraw";

//Import Web3
import getWeb3 from "./getWeb3";

//Import contracts
import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";

//Import style
import "./App.css";


/* ---------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------- */

//Component
const App  = () => {
  //states
  const [state,setState] = useState({web3 : null, accounts: null, contract: null});

  //Effect hook
  useEffect(() => {

    // initializing web3, accounts and contract
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = await FundraiserFactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          FundraiserFactoryContract.abi,
          deployedNetwork && deployedNetwork.address
          );
        setState({web3, accounts, contract: instance});
      } catch (err) {
        alert("Failed to load web3, accounts or network, check console !");
        console.error(err);
      }
    }

    //initialize
    init();
  },[]);



  //render
  return(
    <div>
      <Router>
        <div>

          <nav>
            <NavLink className="nav-link-title" to ="/" end>Decentralized Fundraising</NavLink>
            <ul>
                <li><NavLink className="nav-link" to ="/home/" end>Fundraisers</NavLink></li>
                <li><NavLink className="nav-link" to ="/new/" end>Create</NavLink></li>
                <li><NavLink className="nav-link" to ="/withdraw/" end>Custodian</NavLink></li>
            </ul>
          </nav>
               
            
          <Routes>
            <Route path="/home/"  element={<FundraisersList/>}/>
            <Route path="/new/" element={<NewFundraiser/>}/>
            <Route path="/" element={<Home/>}/>
            <Route path="/withdraw/" element = {<Withdraw/>}/>
          </Routes>

        </div>

        <footer>
          <p>
            <span>Visit my webpage for more !   </span>  
            <a href = "https://taharallouche.github.io/" target="_blank" rel="noopener noreferrer">taharallouche.github.io/</a>
          </p>
        </footer>
      </Router>
    </div>
    )
}

export default App;
