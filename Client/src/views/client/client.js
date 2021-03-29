import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import Web3 from 'web3'
import EthrDID from 'ethr-did'
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

  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      logistics: null,
      account: '',
      did: '',
      role: 'Client',
      orderCount: 0,
      orders: [],
      showInfo: false,
      showOrders: false,
      showNewOrder: false
    }
    this.handleShowInfoNavClick = this.handleShowInfoNavClick.bind(this);
    this.handleShowOrdersNavClick = this.handleShowOrdersNavClick.bind(this);
    this.handleNewOrderNavClick = this.handleNewOrderNavClick.bind(this);
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
      this.setState({web3: window.web3})
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    this.setState({web3})
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = LogisticsContract.networks[networkId]
    if (networkData) {
      const logistics = new web3.eth.Contract(LogisticsContract.abi, networkData.address)
      this.setState({ logistics })
      //const role = await logistics.methods.getRole(this.state.account).call()
      //this.setState({ role })

      const orderCount = await logistics.methods.getOrderCount().call()
      //console.log(orderCount.toString())
      this.setState({ orderCount })
      //Load orders
      for (let i = 0; i <= orderCount; i++) {
        const order = await logistics.methods.orders(i).call()
        //console.log(order)
        this.setState({
          orders: [...this.state.orders, order]
        })
      }
      //if (this.state.did == '') {
      this.createDid()

      //}
    } else {
      window.alert('Logistics contract not deployed to detected network.')
    }
  }


  handleShowInfoNavClick() {
    this.setState(prevState => ({
      showInfo: !prevState.showInfo,
    }))
  };

  handleShowOrdersNavClick() {
    this.setState(prevState => ({
      showOrders: !prevState.showOrders,
    }));
  };

  handleNewOrderNavClick() {
    this.setState(prevState => ({
      showNewOrder: !prevState.showNewOrder,
    }))
  };
/*
  setRole = (add, role) => {
    this.state.logistics.methods.setRole(this.state.account, role).send({from: this.state.account, gas: 80000})
  };*/

  createOrder = (from, to, freightClass, ArrivalTime) => {
    this.state.logistics.methods.createOrder(from, to, freightClass, ArrivalTime).send({ from: this.state.account })
  };

  getOrderNum = async () => {
    const { accounts, contract } = this.state
    const orderNum = await contract.methods.getOrderCount().call()
    this.setState({ orderNum: orderNum })
  };

  getOrders = async () => {
    
  }

  adminOrder = (orderId) => {
    try{
      this.state.logistics.methods.adminOrder(orderId).send({ from: this.state.account, gas: 800000 })
    } catch(err) {
      console.log(err)
    }
  };
/*
  createDid = () => {
    //let registryAddress = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B'
    let provider = this.state.web3
    console.log('hiiii')
    const ethrDid = new EthrDID({address: '0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5',  //account from my metamask wallet
                                privateKey: '771055cfdb54ba804d5e68cd5aedf110c94682cbb64258b3fcf902e8c5ea8f10', 
                                provider})
    console.log('Ethr DID\n\n', ethrDid)
    console.log(ethrDid.did)
    this.setState( {did: ethrDid.did} )
    console.log(this.state.did)
  }*/

  createDid(){
    let provider = this.state.web3
    const ethrDid = new EthrDID({address: '0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5',  //account from my metamask wallet
                                privateKey: '771055cfdb54ba804d5e68cd5aedf110c94682cbb64258b3fcf902e8c5ea8f10', 
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
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
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
                    <h3 className="App-innerHeader">Personal Information</h3>
                    <ShowInfo account={this.state.account} did={this.state.did}/>
                  </div>
                  ):null
                }
                {
                  this.state.showOrders?(
                  <div className="box" >
                    <h3 className="App-innerHeader">My Orders</h3>
                    <p>{this.state.OrderNum}</p>
                    <ShowOrders account={this.state.account} role={this.state.role} orders={this.state.orders} adminOrder={this.adminOrder}/>
                  </div>
                  ):null
                }
                {
                  this.state.showNewOrder?(
                  <div className="box" >
                    <h3 className="App-innerHeader">New Order</h3>
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
