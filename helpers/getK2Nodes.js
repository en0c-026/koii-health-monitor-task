const net = require('net');
const { WebServiceClient } = require('@maxmind/geoip2-node');
const licenseKeyGeoIP2 = "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"
const client = new WebServiceClient('867600', licenseKeyGeoIP2);

async function measureResponseTime(node) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const socket = net.createConnection(node.port, node.host);

    socket.on('connect', () => {
      const end = Date.now();
      const responseTime = end - start;
      resolve({ alive: true, responseTime });
      socket.end();
    });

    socket.on('error', (error) => {
      resolve({ alive: false, responseTime: null })
    });
  });
}


async function getK2Nodes(connection) {
  const nodes = await connection.getClusterNodes()

  let formattedData = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.rpc) {
      const [host, port] = node.rpc.split(':')
      const country = (await client.country(host)).country.isoCode

      const topology = await measureResponseTime({ host, port })
      formattedData[i] = {
        pubkey: node.pubkey,
        ip: host,
        country,
        ...topology
      }
      await new Promise((resolve) => setTimeout(resolve, 500))
    } else {
      const [host] = node.gossip.split(':')
      const country = (await client.country(host)).country.isoCode

      formattedData[i] = {
        pubkey: node.pubkey,
        ip: host,
        country,
        alive: false,
        responseTime: null
      }
    }

  }

  return formattedData
}

module.exports = getK2Nodes;