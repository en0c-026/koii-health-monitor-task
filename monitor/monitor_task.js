require('dotenv').config();
const fs = require('fs')
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const { Connection } = require('@_koi/web3.js');
const createFile = require('../helpers/createFile.js');
const deleteFile = require('../helpers/deleteFile'); 
const getK2Nodes = require('../helpers/getK2Nodes.js')

const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});

const { namespaceWrapper, K2_NODE_URL } = require('../_koiiNode/koiiNode.js');

module.exports = async () => {
  const keypair = await namespaceWrapper.getSubmitterAccount();
  const connection = new Connection(K2_NODE_URL);
  const k2Nodes = await getK2Nodes(connection)
  const timestamp = Date.now()
  const monitorData = { k2Nodes, timestamp };

  const messageUint8Array = new Uint8Array(
    Buffer.from(JSON.stringify(monitorData)),
  );

  const signedMessage = nacl.sign(messageUint8Array, keypair.secretKey);
  const signature = signedMessage.slice(0, nacl.sign.signatureLength);

  const submission_value = {
    data: monitorData,
    node_publicKey: keypair.publicKey,
    node_signature: bs58.encode(signature),
  };

  const path = `./Monitor/data.json`;
  if (!fs.existsSync('./Monitor')) fs.mkdirSync('./Monitor');

  console.log('PATH', path);

  await createFile(path, submission_value);


  if (storageClient) {
    const file = await getFilesFromPath(path);
    const proof_cid = await storageClient.put(file);

    console.log('Proof uploaded to IPFS: ', proof_cid);

    deleteFile(path);

    return { proof_cid, timestamp };

  } else {
    console.log('NODE DO NOT HAVE ACCESS TO WEB3.STORAGE');

  }
};
