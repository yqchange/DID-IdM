//import * as EthrDID from 'ethr-did'
//import { Issuer, JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';
const DB = require("./db.js");
const EthrDID = require('ethr-did');
const Issuer = require('did-jwt-vc');

const HttpProvider = require('ethjs-provider-http')
let provider = new HttpProvider('HTTP://127.0.0.1:7545')
//const JwtCredentialPayload = require('did-jwt-vc');
const { createVerifiableCredentialJwt }= require('did-jwt-vc');
const resolve = require('did-resolver').default;
const registerEthrDidToResolver = require('ethr-did-resolver').default

//const {Issuer, JwtCredentialPayload, createVerifiableCredentialJwt} = require('did-jwt-vc');
module.exports = {

  createVC(sub, nbf, exp) {

  const issuer = new EthrDID({
    address: '0xD23B3BA30F7Dd24026f42185B82F4f391e1219B3',
    privateKey: '7fad661f9311cb596fb4ffa327e7a8f100d3fc6f7e9fafca340d79195d192171',
    provider
  })

  let did = issuer.did
  //console.log('Ethr DID\n\n', issuer)
      /*
      resolve(did)
          .then(didDocument => {
              console.log('\n\nEthr DID Document\n\n')
              console.dir(didDocument)
          })
          .catch(error => {
              console.error(error)
          })*/

  const vcPayload = {
    sub: sub,
    nbf: nbf,
    exp: exp,
    issuer: did,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        degree: {
          type: 'BachelorDegree',
          name: 'Baccalauréat en musiques numériques'
        }
      }
    }
  }

  console.log('payload', vcPayload)

  //const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
  //console.log('jwt', vcJwt)

      var doc = {};
      doc["id"] = sub;
      doc["Credentials"] = vcPayload;
      //console.log(doc)

      var credentialsDB = DB.getCredentialsDB();
      if (!credentialsDB) {
        DB.init();
        credentialsDB = DB.getCredentialsDB();
        console.log('success!!')
      }

      createVerifiableCredentialJwt(vcPayload, issuer)
        .then((result) => {
          credentialsDB.insert(
            { ID: sub, VC: vcPayload, JWT: result }
          );
          console.log('success!!!!')
        })
        .catch((error) => {
          console.log(error, sub);
        });

  }
}

  //createVC('did:ethr:0xFCCCdf1e2e51bc5788A65b96Cb5E0ff4FbdE66c5', 1562950282, 2562950282)
