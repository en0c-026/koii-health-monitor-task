const axios = require("axios");
const getAllTaskIds = require("./getAllTaskIds");

const tasknetUrl = "https://k2-tasknet.koii.live";


async function getNodesByTaskId(taskId) {
  try {
    const res = await axios.get(`${tasknetUrl}/nodes/${taskId}`);
    const nodePublicKeys = res.data.map((node) => (node.submitterPubkey))
    return { taskId, nodePublicKeys, runningNodes: nodePublicKeys.length }
  } catch (error) {
    return [];
  }
}

async function getTaskNodes(connection) {
  const taskIds = await getAllTaskIds(connection)
  let allNodes = []
  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const nodesData = await getNodesByTaskId(taskId)
    if (nodesData.length > 0) {
      allNodes.push(nodesData)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return allNodes

}

module.exports = getTaskNodes