require('dotenv').config();
const { coreLogic } = require('./coreLogic');
const {
  namespaceWrapper,
  taskNodeAdministered,
  app,
} = require('./_koiiNode/koiiNode');
const dataFromCid = require('./helpers/dataFromCid');
const db = require('./db_model');

if (app) {
  //  Write your Express Endpoints here.
  //  For Example
  //  app.post('/accept-cid', async (req, res) => {})

  // Sample API that return your task state

  app.get('/taskState', async (req, res) => {
    const state = await namespaceWrapper.getTaskState();
    console.log('TASK STATE', state);

    res.status(200).json({ taskState: state });
  });
  app.get('/value', async (req, res) => {
    const value = await namespaceWrapper.storeGet('value');
    console.log('value', value);

    res.status(200).json({ value: value });
  });

  app.get('/dashboard-data', async (req, res) => {
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
        const alive = k2Nodes[i].alive;

        if (table[country]) {
          table[country].available += 1;
          if (alive) {
            table[country].online += 1;
          }
        } else {
          table[country] = {
            available: 1,
            online: alive ? 1 : 0
          }
        }
      }

      return table;
    }

    const outputraw = await dataFromCid('ipfs.io', nodeproofCid);


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

  app.get('/dashboard-data/:round', async (req, res) => {
    const { round } = req.params;
    const nodeproofCid = await db.getNodeProofCid(round);

    if (!round > 0 || !nodeproofCid) {
      return res.status(200).json({
        status: "error",
        message: "No data available, please try again later."
      })
    }

    const outputraw = await dataFromCid('ipfs.io', nodeproofCid);

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

  app.get('/node-proof/all', async (req, res) => {
    const cids = await db.getAllCids() || '[]';
    return res.status(200).json({
      status: "ok",
      data: cids
    });
  });

  app.get('/node-proof/id/all', async (req, res) => {
    const rounds = await db.getAllRounds() || '[]';
    const parsed = rounds.sort((a, b) => a.round - b.round);
    return res.status(200).json({ status: "ok", data: parsed });
  });
}

async function setup() {
  /*######################################################
  ################## DO NOT EDIT BELOW #################
  ######################################################*/
  await namespaceWrapper.defaultTaskSetup();
  process.on('message', m => {
    console.log('CHILD got message:', m);
    if (m.functionCall == 'submitPayload') {
      console.log('submitPayload called');
      coreLogic.submitTask(m.roundNumber);
    } else if (m.functionCall == 'auditPayload') {
      console.log('auditPayload called');
      coreLogic.auditTask(m.roundNumber);
    } else if (m.functionCall == 'executeTask') {
      console.log('executeTask called');
      coreLogic.task(m.roundNumber);
    } else if (m.functionCall == 'generateAndSubmitDistributionList') {
      console.log('generateAndSubmitDistributionList called');
      coreLogic.submitDistributionList(m.roundNumber);
    } else if (m.functionCall == 'distributionListAudit') {
      console.log('distributionListAudit called');
      coreLogic.auditDistribution(m.roundNumber);
    }
  });
  /*######################################################
  ################ DO NOT EDIT ABOVE ###################
  ######################################################*/

  /* GUIDE TO CALLS K2 FUNCTIONS MANUALLY

  If you wish to do the development by avoiding the timers then you can do the intended calls to K2 
  directly using these function calls. 

  To disable timers please set the TIMERS flag in task-node ENV to disable

  NOTE : K2 will still have the windows to accept the submission value, audit, so you are expected
  to make calls in the intended slots of your round time. 

  */

  // Get the task state
  //console.log(await namespaceWrapper.getTaskState());

  //GET ROUND

  // const round = await namespaceWrapper.getRound();
  // console.log("ROUND", round);

  // Call to do the work for the task

  //await coreLogic.task();

  // Submission to K2 (Preferablly you should submit the cid received from IPFS)

  //await coreLogic.submitTask(round - 1);

  // Audit submissions

  //await coreLogic.auditTask(round - 1);

  // upload distribution list to K2

  //await coreLogic.submitDistributionList(round - 2)

  // Audit distribution list

  //await coreLogic.auditDistribution(round - 2);

  // Payout trigger

  // const responsePayout = await namespaceWrapper.payoutTrigger();
  // console.log("RESPONSE TRIGGER", responsePayout);

  // logs to be displayed on desktop-node

  //namespaceWrapper.logger('error', 'Internet connection lost');
  // await namespaceWrapper.logger('warn', 'Stakes are running low');
  //await namespaceWrapper.logger('log', 'Task is running');
}

if (taskNodeAdministered) {
  setup();
}