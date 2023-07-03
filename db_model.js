const { namespaceWrapper } = require('./namespaceWrapper');

// db functions for node proofs
const getNodeProofCid = async (round) => {
  const db = await namespaceWrapper.getDb();

  let proofId = getNodeProofId(round);
  if (typeof round === "string" && round.startsWith("node_proofs:")) {
    proofId = round
  }
  try {
    const resp = await db.findOne({ proofId });
    if (resp) {
      return resp.cid;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

const setNodeProofCid = async (round, cid, timestamp) => {
  const db = await namespaceWrapper.getDb();
  try {
    const proofId = getNodeProofId(round);
    await db.insert({ proofId, cid, timestamp });
    return console.log("Node CID set");
  } catch (err) {
    return undefined;
  }
}

const getAllCids = async () => {
  const db = await namespaceWrapper.getDb();
  const nodeProofsRaw = await db.find({
    cid: { $exists: true },
  });
  let cids = nodeProofsRaw.map(nodeProof =>
    nodeProof.cid
  );
  return cids;
}

const getAllRounds = async () => {
  const db = await namespaceWrapper.getDb();
  const nodeProofsRaw = await db.find({
    cid: { $exists: true },
  });
  let rounds = nodeProofsRaw.map(nodeProof => ({
    round: parseInt(nodeProof.proofId.split(':')[1]),
    timestamp: nodeProof.timestamp
  }));
  return rounds;
}

const getNodeProofId = (round) => {
  return `node_proofs:${round}`;
}

module.exports = {
  getNodeProofCid,
  setNodeProofCid,
  getAllCids,
  getAllRounds
}