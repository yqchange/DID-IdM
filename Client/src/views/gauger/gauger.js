import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from '../../serviceWorker';
import Web3 from 'web3'
import EthrDID from 'ethr-did'
import LogisticsContract from "../../contracts/Logistics.json";
import '../../app.css';
import ShowInfo from '../../component/showInfo';
import ShowOrders from '../../component/showOrders';

//import ipfsClient from "ipfs-http-client";
//const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

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


class Gauger extends Component {
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

      const shipCount = await logistics.methods.getShipCount().call()
      //console.log(orderCount.toString())
      this.setState({ shipCount })
      //Load orders
      for (let i = 0; i <= shipCount; i++) {
        const ship = await logistics.methods.ships(i).call()
        console.log(ship)
        this.setState({
          ships: [...this.state.ships, ship]
        })
      }

    }
    else {
      window.alert('Logistics contract not deployed to detected network.')
    }
  }
  
  constructor(props) {
    super(props);
    this.state = {
      logistics: null,
      account: '',
      role: 'Gauger',
      did: '',
      orderCount: 0,   //order market 
      shipCount: 0,
      orders: [],
      ships: [],    //ownership
      confirmed: true,
      showInfo: false,
      showOrders: false,
      showShips: false
    }
    this.handleShowInfoNavClick = this.handleShowInfoNavClick.bind(this);
    this.handleShowOrdersNavClick = this.handleShowOrdersNavClick.bind(this);
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

  handleShowConfirmedOrdersNavClick() {
    this.setState(prevState => ({
      showConfirmedOrders: !prevState.ConfirmedOrders,
    }));
  };
/*
  setRole = (add, role) => {
    //const { accounts, contract } = this.state;
    this.state.logistics.methods.setRole(this.state.account, role).send({from: this.state.account, gas: 300000});
    this.setState({ role: role });
  };*/


  getOrderNum = async () => {
    const { accounts, contract } = this.state;
    const orderNum = await contract.methods.getOrderCount().call();
    this.setState({ orderNum: orderNum });
  };
      
  createDid(){
    let provider = this.state.web3
    const ethrDid = new EthrDID({address: '0xC82641AfC5DFA85bb85bBa55B723303a16B8da2B',  //account from my metamask wallet
                                privateKey: 'eb990406dd45bea9dc0f7f770f8c6a05cd8aabdc4743b27ffe2cfce757893042', 
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
                <h2 className="headerFont">***Gauger Interface***</h2>
              </div>
              <p className="App-intro">
              </p>
              <div className="App-nav">
                <button style={buttonStyle} onClick={this.handleShowInfoNavClick}>My Info</button>
                <button style={buttonStyle} onClick={this.handleShowConfirmedOrdersNavClick} >My Orders</button>
              </div>
              <div className="App-body">
                {
                  this.state.showInfo?(
                  <div className="box" >
                    <h3 className="App-innerHeader">Personal Information</h3>
                    <ShowInfo account={this.state.account} did={this.state.did} role={this.state.role}/>
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

ReactDOM.render(<Gauger />, document.getElementById('Gauger'));

serviceWorker.unregister();
