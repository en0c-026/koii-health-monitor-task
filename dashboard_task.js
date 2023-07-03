const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const { Connection } = require('@_koi/web3.js');
const { namespaceWrapper } = require('./namespaceWrapper');
const createFile = require('./helpers/createFile.js');
const deleteFile = require('./helpers/deleteFile');
const getK2Nodes = require('./helpers/getK2Nodes')

const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});

const { K2_NODE_URL } = require('./init');

const main = async () => {
  console.log('******/  IN Koii Health Monitor Task FUNCTION /******');

  // Load node's keypair from the JSON file
  const keypair = await namespaceWrapper.getSubmitterAccount();

  // TEST For local testing, hardcode the keypair
  // const keypair = Keypair.generate(); 
  const connection = new Connection(K2_NODE_URL);
  const k2Nodes = await getK2Nodes(connection)
  const timestamp = Date.now()
  const dashboardData = { k2Nodes, timestamp };

  const messageUint8Array = new Uint8Array(
    Buffer.from(JSON.stringify(dashboardData)),
  );

  const signedMessage = nacl.sign(messageUint8Array, keypair.secretKey);
  const signature = signedMessage.slice(0, nacl.sign.signatureLength);

  const submission_value = {
    data: dashboardData,
    node_publicKey: keypair.publicKey,
    node_signature: bs58.encode(signature),
  };

  // upload the proofs of the dashboard-data on web3.storage
  const path = `./Dashboard/data.json`;

  if (!fs.existsSync('./Dashboard')) fs.mkdirSync('./Dashboard');

  console.log('PATH', path);

  await createFile(path, submission_value);

  if (storageClient) {

    const file = await getFilesFromPath(path);
    const proof_cid = await storageClient.put(file);
    console.log('Proof uploaded to IPFS: ', proof_cid);

    // deleting the file from fs once it is uploaded to IPFS
    await deleteFile(path);

    return { proof_cid, timestamp };

  } else {

    console.log('NODE DO NOT HAVE ACCESS TO WEB3.STORAGE');

  }
};

module.exports = main;