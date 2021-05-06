//import Gov from '../../api/gov'
//import DB from '../../api/db'
const Web3 = require('web3')
const VC = require('../../api/vc')
const DidRegistryContract = require('ethr-did-registry')

const Contract = require('truffle-contract')
let DidReg = Contract(DidRegistryContract)

function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

function test() {
	// loadWeb3()
	// const web3 = window.web3
	// DidReg.setProvider(web3)
	// let didReg = DidReg.deployed()
	console.log(DidRegistryContract.abi)
}
//DidReg.setProvider(web3.currentProvider)
// let didReg = DidReg.deployed()
/*
export default class Issuer extends components{
	constructor(props) {
		super(props)
	}


}*/

//VC.createVC('did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5', 1562950282, 2562950282)

test()