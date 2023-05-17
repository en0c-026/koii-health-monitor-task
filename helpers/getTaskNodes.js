const axios = require("axios");
const getAllTaskIds = require("./getAllTaskIds");

const tasknetUrl = "https://k2-tasknet.koii.live";


async function getNodesByTaskId(taskId) {
  try {
    const res = await axios.get(`${tasknetUrl}/nodes/${taskId}`);
    const nodePublicKeys = res.data.map((node) => (node.submitterPubkey))
    return { taskId, nodePublicKeys, runningNodes: nodePublicKeys.length }
  } catch (error) {
    console.log('error on getNodesByTaskId', error)
    return [];
  }
}

async function getTaskNodes(connection) {
  const taskIds = await getAllTaskIds(connection)
  let allNodes = []
  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const nodesData = await getNodesByTaskId(taskId)
    allNodes.push(nodesData)
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return allNodes

  // const allNodesUrlsFlat = allNodesUrlsRaw.flat();
  // const allNodesUrlsUnique = [...new Set(allNodesUrlsFlat)];

  // let taskNodes = []
  // for (let i = 0; i < allNodesUrlsUnique.length; i++) {
  //   const url = allNodesUrlsUnique[i];
  //   console.log(url);
  //   const response = await getIp(url)
  //   console.log(response);
  //   taskNodes.push(response)
  //   await new Promise((resolve) => setTimeout(resolve, 250))

  // }

  // return taskNodes

}

module.exports = getTaskNodes