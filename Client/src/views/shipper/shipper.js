import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import Web3 from 'web3'
import LogisticsContract from "../../contracts/Logistics.json";
import '../../app.css';
import ShowInfo from '../../component/showInfo';
import ShowOrders from '../../component/showOrders';
import ShowShips from '../../component/showShips';

//import ipfsClient from "ipfs-http-client";
//const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

//Styles
const inputStyle={
  borderRadius:5,
  fontSize:15,
  borderTop:0,
  borderLeft:0,
  borderRight:0,
  height:30,
  marginRight:10
};
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
const buttonStyle2={
  borderRadius:5,
  fontSize:15,
  borderTop:0,
  borderLeft:0,
  borderRight:0,
  height:40,
  width: 100,
  marginLeft: 10,
  color:"white",
  backgroundColor:"coral"
};
const popupStyle={
  borderRadius:5,
  backgroundColor:"#f6f5be",
  width:300,
  zIndex:100,
  margin:"auto",
  fontSize:15,
  marginTop:30,
  marginBottom:30,
  borderWidth:2
};
const buttonStyle3={
  borderRadius:5,
  fontSize:13,
  height:30,
  width: 60,
  marginLeft: 10,
  color:"white",
  backgroundColor:"coral"
};


class Shipper extends Component {

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
      //Load orders
      for (let i = 0; i <= orderCount; i++) {
        const order = await logistics.methods.orders(i).call()
        this.setState({
          orders: [...this.state.orders, order]
        })
      }
      // Load my confirmed orders
      const confirmOrders = this.state.orders.filter((order) => order.shipper == this.state.account)
      this.setState({ confirmOrders })
      //Load own ships
      const ships = await logistics.methods.shipOwnership(this.state.account).call()
      this.setState({ ships })
    } else {
      window.alert('Logistics contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      logistics: null,
      account: '',
      role: '',
      orderCount: 0,   //order market 
      orders: [],
      ships: [],    //ownership
      confirmOrders: [],
      showInfo: false,
      showOrders: false,
      showShips: false,
      showConfirmedOrders: false,
    }
    this.handleShowInfoNavClick = this.handleShowInfoNavClick.bind(this);
    this.handleShowOrdersNavClick = this.handleShowOrdersNavClick.bind(this);
    this.handleShipsNavClick = this.handleShipsNavClick.bind(this);
    this.handleShowConfirmedOrdersNavClick = this.handleShowConfirmedOrdersNavClick.bind(this);
  };

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
    //const { accounts, contract } = this.state;
    this.state.logistics.methods.setRole(add, role).send({from: this.state.account, gas: 300000});
  };

  confirmOrder = (orderID) => {
    this.state.logistics.methods.confirmOrder(orderID).send({ from: this.state.account });
  };

  getOrderNum = async () => {
    const { accounts, contract } = this.state;
    const orderNum = await contract.methods.getOrderCount().call();
    this.setState({ orderNum: orderNum });
  };

  addShip = async (addr) => {
    this.state.logistics.methods.AddShip(addr).send({ from: this.state.account });
  };

  addOrderToShip = async (shipID, orderID) => {
    this.state.logistics.methods.AddOrderToShip(shipID, orderID).send({ from: this.state.account });
  }

  askForClearance = async (shipID) => {
    this.state.logistics.methods.AddOrderToShip(shipID).send({ from: this.state.account });
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
                <h2 className="headerFont">***Shipper Interface***</h2>
              </div>
              <p className="App-intro">
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
                    <h3 className="App-innerHeader"></h3>
                    <ShowInfo account={this.state.account} setRole={this.setRole} role={this.state.role}/>
                  </div>
                  ):null
                }
                {
                  this.state.showOrders?(
                  <div className="box" >
                    <h3 className="App-innerHeader">Orders</h3>
                    <p>{this.state.OrderNum}</p>
                    <ShowOrders account={this.state.account} orders={this.state.orders} role={this.state.role} askForClearance={this.askForClearance}/>
                  </div>
                  ):null
                }
                {
                  this.state.showShips?(
                  <div className="box" >
                    <h3 className="App-innerHeader"></h3>
                    <ShowShips account={this.state.account} addShip={this.addShip}  addOrderToShip={this.addOrderToShip} />
                  </div>
                  ):null
                }
                {
                  this.state.showConfirmedOrders?(
                  <div className="box" >
                    <h3 className="App-innerHeader"></h3>
                    <ShowOrders account={this.state.account} orders={this.state.confirmOrders} role={this.state.role} addOrderToShip={this.addOrderToShip}/>
                  </div>
                  ):null
                }
              </div>
            </div>
    );
  }
}

ReactDOM.render(<Shipper />, document.getElementById('shipper'));

serviceWorker.unregister();
