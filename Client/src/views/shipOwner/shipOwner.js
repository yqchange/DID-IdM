import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import Web3 from 'web3'
import EthrDID from 'ethr-did'
import LogisticsContract from "../../contracts/Logistics.json";
import '../../app.css';
import ShowInfo from '../../component/showInfo';
import ShowOrders from '../../component/showOrders';
import ShowShips from '../../component/showShips';
import Market from '../../component/market';
import VC from '../../api/vc';
import AWS from '../../api/aws';

import ipfsClient from "ipfs-http-client";
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

//Styles

const buttonStyle={
  borderRadius:5,
  fontSize:15,
  borderTop:0,
  borderLeft:0,
  borderRight:0,
  height:40,
  width: 90,
  marginLeft: 180,
  color:"white",
  backgroundColor:"LightSalmon"
};


class ShipOwner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      logistics: null,
      account: '',
      role: 'ShipOwner',
      did: '',
      orderCount: 0,   //order market 
      //shipCount: 0,
      orders: [],
      ships: [],    //ownership
      showInfo: false,
      showOrders: false,
      showShips: false,
    }
    this.handleShowInfoNavClick = this.handleShowInfoNavClick.bind(this);
    this.handleShowOrdersNavClick = this.handleShowOrdersNavClick.bind(this);
    this.handleShipsNavClick = this.handleShipsNavClick.bind(this);
    this.handleShowConfirmedOrdersNavClick = this.handleShowConfirmedOrdersNavClick.bind(this);
  };

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    this.setState({ web3 })
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = LogisticsContract.networks[networkId]
    if (networkData) {
      const logistics = new web3.eth.Contract(LogisticsContract.abi, networkData.address)
      this.setState({ logistics })
      const role = await logistics.methods.getRole(this.state.account).call()
      this.setState({ role })
      const orderCount = await logistics.methods.getOrderCount().call()
      this.setState({ orderCount })
      /*try{
        const ship = await logistics.methods.shipOwnership(this.state.account).call()
        //console.log(ship)
      }catch (err) {
        console.log(err);
      }*/
      //Load orders
      for (let i = 0; i <= orderCount; i++) {
        const order = await logistics.methods.orders(i).call()
        //console.log(order)
        this.setState({
          orders: [...this.state.orders, order]
        })
      }
      
    }
    else {
      window.alert('Logistics contract not deployed to detected network.')
    }
  }
  

  handleShowInfoNavClick() {
    this.setState(prevState => ({
      showInfo: !prevState.showInfo,
    }));
  };

  handleShowOrdersNavClick() {
    this.setState(prevState => ({
      showOrders: !prevState.showOrders,
    }));
  };

  handleShipsNavClick() {
    this.setState(prevState => ({
      showShips: !prevState.showShips,
    }));
  };

  handleShowConfirmedOrdersNavClick() {
    this.setState(prevState => ({
      showConfirmedOrders: !prevState.ConfirmedOrders,
    }));
  };

  setRole = (add, role) => {
    this.state.logistics.methods.setRole(add, role).send({from: this.state.account, gas: 300000});
    this.setState({ role: role });
  };

  bidOrder = (orderID, price) => {
    this.state.logistics.methods.bidOrderByShipOwner(orderID, price).send({ from: this.state.account });
  };

  getShipCount = async (shipID) => {
    const count = await this.state.logistics.methods.getShipCount().call();
    this.setState({shipCount: count})
  };

  addShip = async (shipID) => {
    //console.log(this.state.web3.utils.fromAscii(shipID), shipID)
    this.state.logistics.methods.AddShip(shipID).send({ from: this.state.account });
    const count = await this.state.logistics.methods.getShipCount().call();
    this.setState({shipCount: count})
  };

  askForClearance = async (shipID) => {
    this.state.logistics.methods.askForClearance(shipID).send({ from: this.state.account });
  }
  
  createDid(){
    let provider = this.state.web3
    const ethrDid = new EthrDID({address: '0xFe941a539EBa7E60071D83EfE71044C2f9FC0C1A',  //account from my metamask wallet
                                privateKey: '4eaa598de6f1c212f2420683fb8588f80530db7d71c815dba1b5d4521946d6f3', 
                                provider})
    console.log('Ethr DID\n\n', ethrDid)
    console.log(ethrDid.did)
    this.setState( {did: ethrDid.did} )
    console.log(this.state.did)
  }

  componentDidMount() {
    if (this.state.did == '') {
      this.createDid()
    }
  }
  
  render() {
    //if (!this.state.web3) {
      //return <div>Loading Web3, accounts, and contract...</div>;
   // }
    //const { accounts, contract } = this.props;
    return (
            <div className="App">
              <div className="App-header">
                <h2 className="headerFont">Waterway Transportation Identity Management System</h2>
                <h2 className="headerFont">***Ship Owner Interface***</h2>
              </div>
              <p className="App-intro">{this.state.shipCount}
              </p>
              <div className="App-nav">
                <button style={buttonStyle} onClick={this.handleShowOrdersNavClick} >Market</button>
                <button style={buttonStyle} onClick={this.handleShowInfoNavClick}>My Info</button>
                <button style={buttonStyle} onClick={this.handleShipsNavClick}>My Ships</button>
                <button style={buttonStyle} onClick={this.handleShowConfirmedOrdersNavClick} >My Orders</button>
              </div>
              <div className="App-body">
                {
                  this.state.showInfo?(
                  <div className="box" >
                    <h3 className="App-innerHeader">Personal Information</h3>
                    <ShowInfo account={this.state.account} setRole={this.setRole} did={this.state.did} role={this.state.role}/>
                  </div>
                  ):null
                }
                {
                  this.state.showOrders?(
                  <div className="box" >
                    <h3 className="App-innerHeader">Market</h3>
                    <Market account={this.state.account} orders={this.state.orders} web3={this.state.web3} role={this.state.role} bidOrder={this.bidOrder}/>
                  </div>
                  ):null
                }
                {
                  this.state.showShips?(
                  <div className="box" >
                    <h3 className="App-innerHeader">My Ships</h3>
                    <ShowShips account={this.state.account} ships={this.state.ships} count={this.state.shipCount} addShip={this.addShip} askForClearance={this.askForClearance}/>
                  </div>
                  ):null
                }
                {
                  this.state.showConfirmedOrders?(
                  <div className="box" >
                    <h3 className="App-innerHeader">My Orders</h3>
                    <ShowOrders account={this.state.account} orders={this.state.orders} role={this.state.role} addOrderToShip={this.addOrderToShip}/>
                  </div>
                  ):null
                }
              </div>
            </div>
    );
  }
}

ReactDOM.render(<ShipOwner />, document.getElementById('ShipOwner'));

serviceWorker.unregister();
