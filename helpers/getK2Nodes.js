const net = require('net');
const { default: axios } = require('axios');
const GEO2IP_URL = "https://geoip.maxmind.com/geoip/v2.1/country/"
const GEO2IP_ACCOUNT = "867600"
const GEO2IP_KEY = "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"

async function geolocalizate(ip) {
  const credentials = Buffer.from(`${GEO2IP_ACCOUNT}:${GEO2IP_KEY}`).toString('base64');
  const response = await axios.get(`${GEO2IP_URL}/${ip}`, {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  })
  return response.data
}

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
      const country = (await geolocalizate(host)).country.iso_code
      const topology = await measureResponseTime({ host, port })
      formattedData[i] = {
        pubkey: node.pubkey,
        ip: host,
        country,
        ...topology
      }
    } else {
      const [host] = node.gossip.split(':')
      const country = (await geolocalizate(host)).country.iso_code

      formattedData[i] = {
        pubkey: node.pubkey,
        ip: host,
        country,
        alive: false,
        responseTime: null
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500))

  }

  return formattedData
}

module.exports = getK2Nodes;