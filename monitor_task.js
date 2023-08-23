require('dotenv').config();
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const { Web3Storage, getFilesFromPath } = require('web3.storage');
const { Connection } = require('@_koi/web3.js');
const getK2Nodes = require('./helpers/getK2Nodes')

const storageClient = new Web3Storage({
  token: process.env.SECRET_WEB3_STORAGE_KEY,
});

const { namespaceWrapper, K2_NODE_URL } = require('./_koiiNode/koiiNode.js');

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
  const exist = await namespaceWrapper.fs('existsSync', './Monitor')
  if (!exist) await namespaceWrapper.fs('mkdir', './Monitor')

  await namespaceWrapper.fs('writeFile', path, JSON.stringify(submission_value))


  if (storageClient) {
    const file = await getFilesFromPath(path);
    const proof_cid = await storageClient.put(file);

    console.log('Proof uploaded to IPFS: ', proof_cid);

    await namespaceWrapper.fs('unlink', path);

    return { proof_cid, timestamp };

  } else {
    console.log('NODE DO NOT HAVE ACCESS TO WEB3.STORAGE');

  }
};
