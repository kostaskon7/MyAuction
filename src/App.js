import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { highestBid: 0, web3: null, accounts: null, contract: null, input: "", highestBidder: "", accountBid: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      const highestBid_response = await instance.methods.highestBid().call();
      const highestBidder_response = await instance.methods.highestBidder().call();
      const accountBid_response = await instance.methods.userBalances(accounts[0]).call();

      this.setState({ web3, accounts, contract: instance, highestBid: highestBid_response,  highestBidder: highestBidder_response, accountBid: accountBid_response});
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    const { accounts, contract, web3 } = this.state;
    const bid_value = await web3.utils.toWei(this.state.input, 'ether');
    // Stores the given value
    await contract.methods.bid().send({ from: accounts[0], value: bid_value});
    this.setState({highestBid: bid_value,  highestBidder: accounts[0], accountBid: bid_value});
  };
  
  withdraw = async () => {
    const { accounts, contract } = this.state;

    // Stores the given value
    await contract.methods.withdraw().send({ from: accounts[0]});
    this.setState({accountBid: 0});
  };
  
  myChangeHandler = (event) => {
    this.setState({input: event.target.value}, () => {
      console.log(this.state.input)
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Auction</h1>

        <div>Your bid is: {this.state.accountBid} Wei</div>
		<div>The highest Bidder is: {this.state.highestBidder}</div> 
        <div>The highest Bid is: {this.state.highestBid} Wei</div>
        
        <div>Enter your bid (Ether):</div>
	<input type='text' onChange={this.myChangeHandler}/>
	<button onClick={this.bid}>Bid</button>
	<button onClick={this.withdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
