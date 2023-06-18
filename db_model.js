const { namespaceWrapper } = require('./namespaceWrapper');

// db functions for node proofs
const getNodeProofCid = async (round) => {
  const db = await namespaceWrapper.getDb();

  let NodeProofsCidId = getNodeProofCidid(round);
  if (typeof round === "string" && round.startsWith(node_proofs)) {
    NodeProofsCidId = round
  }
  try {
    const resp = await db.findOne({ NodeProofsCidId });
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

const setNodeProofCid = async (round, cid) => {
  const db = await namespaceWrapper.getDb();
  try {
    const NodeProofsCidId = getNodeProofCidid(round);
    await db.insert({ NodeProofsCidId, cid });
    return console.log("Node CID set");
  } catch (err) {
    return undefined;
  }
}

const getAllNodeProofCids = async () => {
  const db = await namespaceWrapper.getDb();
  const NodeproofsListRaw = await db.find({
    cid: { $exists: true },
  });
  let NodeproofsList = NodeproofsListRaw.map(NodeproofsList =>
    NodeproofsList.cid
  );
  return NodeproofsList;
}

const getAllNodeProofIds = async () => {
  const db = await namespaceWrapper.getDb();
  const NodeproofsListRaw = await db.find({
    cid: { $exists: true },
  });
  let NodeproofIdsList = NodeproofsListRaw.map(NodeproofsList =>
    NodeproofsList.NodeProofsCidId
  );
  return NodeproofIdsList;
}


const getNodeProofCidid = (round) => {
  return `node_proofs:${round}`;
}

module.exports = {
  getNodeProofCid,
  setNodeProofCid,
  getAllNodeProofCids,
  getAllNodeProofIds
}