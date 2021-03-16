import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import Web3 from 'web3'
import LogisticsContract from "../../contracts/Logistics.json";
import '../../app.css';
import NewOrder from '../../component/newOrder';
import ShowInfo from '../../component/showInfo';
import ShowOrders from '../../component/showOrders';
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


class Client extends Component {

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
      //console.log(orderCount.toString())
      this.setState({ orderCount })
      //Load orders
      for (let i = 0; i <= orderCount; i++) {
        const order = await logistics.methods.orders(i).call()
        this.setState({
          orders: [...this.state.orders, order]
        })
      }
      //this.setState({ loading: false })
      console.log(this.state.orders)
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
      orderCount: 0,
      orders: [],
      showInfo: false,
      showOrders: false,
      showNewOrder: false,
    }
    this.handleShowInfoNavClick = this.handleShowInfoNavClick.bind(this);
    this.handleShowOrdersNavClick = this.handleShowOrdersNavClick.bind(this);
    this.handleNewOrderNavClick = this.handleNewOrderNavClick.bind(this);
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

  handleNewOrderNavClick() {
    this.setState(prevState => ({
      showNewOrder: !prevState.showNewOrder,
    }));
  };

  setRole = (add, role) => {
    //const { accounts, contract } = this.state;
    this.state.logistics.methods.setRole(add, role).send({from: this.state.account, gas: 3000000});
  };

  createOrder = (from, to, freightClass, ArrivalTime) => {
    //this.setState({ loading: true })
    this.state.logistics.methods.createOrder(from, to, freightClass, ArrivalTime).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        //this.setState({ loading: false })
      })
  };

  getOrderNum = async () => {
    const { accounts, contract } = this.state;
    const orderNum = await contract.methods.getOrderCount().call();
    this.setState({ orderNum: orderNum });
  };
      
  render() {
    //if (!this.state.web3) {
      //return <div>Loading Web3, accounts, and contract...</div>;
   // }
    //const { accounts, contract } = this.props;
    return (
            <div className="App">
              <div className="App-header">
                <h2 className="headerFont">Waterway Transportation Identity Management System</h2>
                <h2 className="headerFont">***Client Interface***</h2>
              </div>
              <p className="App-intro">
              </p>
              <div className="App-nav">
                <button style={buttonStyle} onClick={this.handleShowInfoNavClick}>My Info</button>
                <button style={buttonStyle} onClick={this.handleShowOrdersNavClick} >My Orders</button>
                <button style={buttonStyle} onClick={this.handleNewOrderNavClick}>New Order</button>
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
                    <ShowOrders account={this.state.account} orders={this.state.orders} role={this.state.role}/>
                  </div>
                  ):null
                }
                {
                  this.state.showNewOrder?(
                  <div className="box" >
                    <h3 className="App-innerHeader"></h3>
                    <NewOrder account={this.state.account} createOrder = {this.createOrder}/>
                  </div>
                  ):null
                }
              </div>
            </div>
    );
  }
}

ReactDOM.render(<Client />, document.getElementById('client'));

serviceWorker.unregister();
