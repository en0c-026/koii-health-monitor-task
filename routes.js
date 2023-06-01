const express = require('express');
const router = express.Router();
const db = require('./db_model');
const fs = require('fs');
const { namespaceWrapper } = require('./namespaceWrapper');
const dataFromCid = require('./helpers/dataFromCid');

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});

router.get('/taskState', async (req, res) => {
  const state = await namespaceWrapper.getTaskState();
  console.log("TASK STATE", state);

  res.status(200).json({ taskState: state })
})


router.get("/logs", async (req, res) => {
  const logs = fs.readFileSync("./namespace/logs.txt", "utf8")
  res.status(200).send(logs);
})

router.get('/dashboard-data', async (req, res) => {
  const round = await namespaceWrapper.getRound()
  const nodeproofCid = await db.getNodeProofCid(round)
  if (!round > 0 || !nodeproofCid) {
    return res.status(200).send("No data available, please try again later.")
  }
  
  const outputraw = await dataFromCid(nodeproofCid);
  let dashboardData = outputraw.data
  dashboardData = dashboardData || '{}';
  return res.status(200).send(dashboardData);
});

router.get('/node-proof/all', async (req, res) => {
  allNodeProofs = await db.getAllNodeProofCids() || '[]';
  return res.status(200).send(allNodeProofs);
});

router.get('/node-proof/:round', async (req, res) => {
  const { round } = req.params;
  let nodeproof = await db.getNodeProofCid(round) || '[]';
  return res.status(200).send(nodeproof);
});

router.get('/nodeurl', async (req, res) => {
  const nodeUrlList = await namespaceWrapper.getNodes();
  return res.status(200).send(nodeUrlList);
});

module.exports = router;