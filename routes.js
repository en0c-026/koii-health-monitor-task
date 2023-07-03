const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const db = require('./db_model');
const fs = require('fs');
const { namespaceWrapper } = require('./namespaceWrapper');
const dataFromCid = require('./helpers/dataFromCid');

const gateway = 'ipfs.io'
// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});

router.get('/taskState', async (req, res) => {
  const state = await namespaceWrapper.getTaskState();
  console.log("TASK STATE", state);

  res.status(200).json({ taskState: state })
});

router.get("/logs", async (req, res) => {
  const logs = fs.readFileSync("./namespace/logs.txt", "utf8")
  res.status(200).send(logs);
});

router.get('/dashboard-data', async (req, res) => {
  const round = (await namespaceWrapper.getRound()) - 1
  const nodeproofCid = await db.getNodeProofCid(round)
  if (!round > 0 || !nodeproofCid) {
    return res.status(200).json({
      status: "error",
      message: "No data available, please try again later."
    })
  }


  const getCountByCountries = (k2Nodes) => {
    const table = {};

    for (let i = 0; i < k2Nodes.length; i++) {
      const country = k2Nodes[i].country;

      if (table[country]) {
        table[country] += 1;
      } else {
        table[country] = 1;
      }
    }

    return table;
  }

  const outputraw = await dataFromCid(gateway, nodeproofCid);


  if (!outputraw || !outputraw.data) {
    res.status(404).json({
      status: "error",
      message: "Data not found."
    })
  }

  const timestamp = outputraw.data.data.timestamp
  const k2Nodes = outputraw.data.data.k2Nodes
  let averageResponseTime = k2Nodes
    .filter(node => node.alive)
    .reduce((sum, node) => sum + node.responseTime, 0)
    / k2Nodes.length
  averageResponseTime = Math.round(averageResponseTime)
  const availableNodes = k2Nodes.length
  const onlineNodes = k2Nodes.filter(k2Node => k2Node.alive).length
  const countByCountry = getCountByCountries(k2Nodes)

  return res.status(200).json({
    status: "ok",
    data: {
      timestamp,
      k2Nodes,
      averageResponseTime,
      availableNodes,
      onlineNodes,
      countByCountry
    }
  });
});

router.get('/dashboard-data/:round', async (req, res) => {
  const { round } = req.params;
  const nodeproofCid = await db.getNodeProofCid(round);

  if (!round > 0 || !nodeproofCid) {
    return res.status(200).json({
      status: "error",
      message: "No data available, please try again later."
    })
  }

  const outputraw = await dataFromCid(gateway, nodeproofCid);

  if (!outputraw || !outputraw.data) {
    res.status(404).json({
      status: "error",
      message: "Data not found."
    })
  }

  const timestamp = outputraw.data.data.timestamp
  const k2Nodes = outputraw.data.data.k2Nodes
  let averageResponseTime = k2Nodes
    .filter(node => node.alive)
    .reduce((sum, node) => sum + node.responseTime, 0)
    / k2Nodes.length
  averageResponseTime = Math.round(averageResponseTime)
  const availableNodes = k2Nodes.length
  const onlineNodes = k2Nodes.filter(k2Node => k2Node.alive).length

  return res.status(200).json({
    status: "ok",
    data: {
      timestamp,
      k2Nodes,
      averageResponseTime,
      availableNodes,
      onlineNodes
    }
  });
});

router.get('/node-proof/all', async (req, res) => {
  const cids = await db.getAllCids() || '[]';
  return res.status(200).json({
    status: "ok",
    data: cids
  });
});

router.get('/node-proof/id/all', async (req, res) => {
  const rounds = await db.getAllRounds() || '[]';
  const parsed = rounds.sort((a, b) => a.round - b.round);
  return res.status(200).json({ status: "ok", data: parsed });
});

router.get('/nodeurl', async (req, res) => {
  const nodeUrlList = await namespaceWrapper.getNodes();
  return res.status(200).send(nodeUrlList);
});

module.exports = router;