const { namespaceWrapper } = require('./namespaceWrapper');

// db functions for node proofs
const getNodeProofCid = async (round) => {
  return new Promise((resolve, reject) => {
    namespaceWrapper.levelDB.get(getNodeProofCidid(round), (err, value) => {
      if (err) {
        console.error("Error in getNodeProofCid:", err);
        resolve(null);
      } else {
        resolve(value.toString() || "[]");
      }
    });
  });
}

const setNodeProofCid = async (round, cid) => {
  namespaceWrapper.levelDB.put(getNodeProofCidid(round), cid);
  return console.log("Node CID set");
}

const getAllNodeProofCids = async () => {
  return new Promise((resolve, reject) => {
    let dataStore = [];
    const nodeProofsStream = namespaceWrapper.levelDB.createReadStream({
      gt: 'node_proofs:',
      lt: 'node_proofs~',
      reverse: true,
      keys: true,
      values: true
    })
    nodeProofsStream
      .on('data', function (data) {
        console.log(data.key.toString(), '=', data.value.toString())
        dataStore.push({ key: data.key.toString(), value: data.value.toString() });
      })
      .on('error', function (err) {
        console.log('Something went wrong in read nodeProofsStream!', err);
        reject(err);
      })
      .on('close', function () {
        console.log('Stream closed')
      })
      .on('end', function () {
        console.log('Stream ended')
        resolve(dataStore);
      })
  });
}


const getNodeProofCidid = (round) => {
  return `node_proofs:${round}`;
}

module.exports = {
  getNodeProofCid,
  setNodeProofCid,
  getAllNodeProofCids,
}