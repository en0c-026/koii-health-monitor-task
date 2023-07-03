const dataFromCid = require('./helpers/dataFromCid');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const iso3166 = require('iso-3166-1');

module.exports = async (gateway, submission_value) => {
  console.log('******/ Dashboard Data CID VALIDATION Task FUNCTION /******');
  const outputraw = await dataFromCid(gateway, submission_value);
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
  console.log('dashboard_data from verifyDashboardData', dashboard_data);
  let isValid = true;
  const k2Nodes = dashboard_data.k2Nodes;
  
  for (const k2Node in k2Nodes) {
    const countryExist = iso3166.whereAlpha2(k2Node.country)
    if (!countryExist) {
      console.log('fail to validate countryExist from verifyDashboardData');
      isValid = false
    }
  }

  const k2NodesOnline = k2Nodes.filter((node) => node.alive && !!node.responseTime)
  const maxAllowedResponseTime = 2000

  for (const k2NodeOnline of k2NodesOnline) {
    if (k2NodeOnline.responseTime > maxAllowedResponseTime) {
      console.log('fail to validate responseTime from verifyDashboardData', k2NodeOnline.responseTime, maxAllowedResponseTime);
      isValid = false
    }
  }

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
