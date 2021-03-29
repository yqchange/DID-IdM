//import * as EthrDID from 'ethr-did'
//import { Issuer, JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';

const DB = require("./db.js");
const EthrDID = require('ethr-did');
const Issuer = require('did-jwt-vc');

const HttpProvider = require('ethjs-provider-http')
let provider = new HttpProvider('HTTP://127.0.0.1:7545')
//const JwtCredentialPayload = require('did-jwt-vc');
const { createVerifiableCredentialJwt }= require('did-jwt-vc');

const { createVerifiablePresentationJwt }= require('did-jwt-vc');


//const {Issuer, JwtCredentialPayload, createVerifiableCredentialJwt} = require('did-jwt-vc');
//module.exports = {

let createVP = (sub) => {
//createVP(sub) {  //according to smart contract

  const issuer = new EthrDID({
    address: '0xD23B3BA30F7Dd24026f42185B82F4f391e1219B3',
    privateKey: '7fad661f9311cb596fb4ffa327e7a8f100d3fc6f7e9fafca340d79195d192171',
    provider
  })

  let did = issuer.did

  var credentialsDB = DB.getCredentialsDB();
  if (!credentialsDB) {
    DB.init();
    credentialsDB = DB.getCredentialsDB();
    //console.log('success!!')
  }

  var list = null
  credentialsDB.findOne({
    ID: 'did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5'
  }, (err, docs) => {
    //console.log(docs);
    list = docs.VC
    console.log(typeof(list))
    console.log('Hiiii', list);
    const vpPayload = {
    "issuer": sub,   // ship owner address
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: list
    }};
    var representationsDB = DB.getRepresentationsDB();
  if (!representationsDB) {
    DB.init();
    representationsDB = DB.getRepresentationsDB();
    console.log('success!!')
  }

  representationsDB.insert(
    { ID: sub, VP: vpPayload }
  ); 
  
    //console.log('test', json_decode(list, true))
  });

/*
  getList = async() => {
      await credentialsDB.findOne({
      ID: 'did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5'
    }, (err, docs) => {
      //console.log(docs);
      console.log('Hiiii', docs.VC);
    });
    
  }

  var x = new Promise((resolve, reject){
    credentialsDB.findOne({
      ID: 'did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5'
    }, (err, docs) => {
        resolve(docs);
    });
});*/

//console.log(list)
/*
  const vpPayload = {
    "issuer": sub,   // ship owner address
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [{"sub":"did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5","nbf":1562950282,"exp":2562950282,"issuer":"did:ethr:0xD23B3BA30F7Dd24026f42185B82F4f391e1219B3","vc":{"@context":["https://www.w3.org/2018/credentials/v1"],"type":["VerifiableCredential"],"credentialSubject":{"degree":{"type":"BachelorDegree","name":"Baccalauréat en musiques numériques"}}}}],
    }
  }*/

  //console.log('payload', vpPayload)
  //const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer)

  //const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
  //console.log('jwt', vcJwt)
/*
  var representationsDB = DB.getRepresentationsDB();
  if (!representationsDB) {
    DB.init();
    representationsDB = DB.getRepresentationsDB();
    console.log('success!!')
  }

  representationsDB.insert(
    { ID: sub, VP: vpPayload }
  ); */
}
//}

createVP('did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5')
