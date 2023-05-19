const { WebServiceClient } = require('@maxmind/geoip2-node');
const licenseKeyGeoIP2 = "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"
const client = new WebServiceClient('867600', licenseKeyGeoIP2);

async function getK2Nodes(connection) {
  const nodes = await connection.getClusterNodes()
  let availableNodes = nodes.map(node => ({ pubkey: node.pubkey, ip: node.gossip.split(':')[0] }))

  let formattedData = []
  for (let i = 0; i < availableNodes.length; i++) {
    const node = availableNodes[i];
    const country = (await client.country(node.ip)).country.isoCode
    formattedData[i] = { ...node, country }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return formattedData
}

module.exports = getK2Nodes;