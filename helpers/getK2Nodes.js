async function getK2Nodes(connection) {
  const nodes = await connection.getClusterNodes()
  const availableNodes = nodes.map(node => ({ pubkey: node.pubkey, ip: node.gossip.split(':')[0] }))
  const onlineNodes = await await connection.getVoteAccounts()
  const onlineNodesPubKeys = onlineNodes.current.map(node => node.nodePubkey);
  const online = availableNodes.filter(node => onlineNodesPubKeys.includes(node.pubkey));
  return { available: availableNodes, online };
}

module.exports = getK2Nodes;
