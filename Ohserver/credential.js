import { Credentials } from 'uport-credentials'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

//const Rresolve = require('did-resolver').default;

let test = async () => {
	const providerConfig = { rpcUrl: 'https://mainnet.infura.io/<30b824dfbf5b45bb951c4a06a769a89c>' }
	const resolver = new Resolver(getResolver(providerConfig))

	// For ethereum based addresses (ethr-did)
	const credentials = new Credentials({
	  appName: 'IdM',
	  did: 'did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5',
	  privateKey: process.env.PRIVATE_KEY,
	  resolver
	})
	console.log(credentials)

}

test()