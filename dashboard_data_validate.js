const dataFromCid = require('./helpers/dataFromCid');
const db = require('./db_model');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { default: axios } = require('axios');
const { namespaceWrapper } = require('./namespaceWrapper');
const Web3 = require('web3');
const web3 = new Web3();
const ethUtil = require('ethereumjs-util');

module.exports = async (submission_value, round) => {
  console.log('******/ Dashboard Data CID VALIDATION Task FUNCTION /******');
  const outputraw = await dataFromCid(submission_value);
  const output = outputraw.data;
  console.log('OUTPUT', output);
  console.log('PUBLIC KEY', output.node_publicKey);
  console.log('SIGNATURE', output.node_signature);

  // Check that the node who submitted the proofs is a valid staked node
  let isNode = await verifyNode(
    output.data,
    output.node_signature,
    output.node_publicKey,
  );
  console.log("Is the node's signature on the CID payload correct?", isNode);

  let isDashboardData = await verifyDashboardData(output.data);
  console.log('IS DASHBOARD_DATA True?', isDashboardData);

  if (isNode && isDashboardData) return true; // if both are true, return true
  else return false; // if one of them is false, return false
};


async function verifyDashboardData(dashboard_data) {

  // TEST hardcode the node list
  // const nodeUrlList = [
  //   "http://localhost:10000",
  // ]
  let isValid = true;

  // check that dashboard_data is valid ?

  return isValid

}

// verifies that a node's signature is valid, and rejects situations where CIDs from IPFS return no data or are not JSON
async function verifyNode(data, signature, publicKey) {
  const messageUint8Array = new Uint8Array(
    Buffer.from(JSON.stringify(data)),
  );
  const signatureUint8Array = bs58.decode(signature);
  const publicKeyUint8Array = bs58.decode(publicKey);

  if (!data || !signature || !publicKey) {
    console.error('No data received from web3.storage');
    return false;
  }

  // verify the node signature
  const isSignatureValid = await verifySignature(
    messageUint8Array,
    signatureUint8Array,
    publicKeyUint8Array,
  );

  return isSignatureValid;
}

async function verifySignature(message, signature, publicKey) {
  return nacl.sign.detached.verify(message, signature, publicKey);
}
