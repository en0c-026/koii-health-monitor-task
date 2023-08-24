const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const monitorTask = require('../monitor/monitor_task')
const db = require('../db_model');

class Submission {
  async task(round) {
    try {
      const { proof_cid, timestamp } = await monitorTask()
      console.log('ROUND', round);

      if (proof_cid) {
        await db.setNodeProofCid(round, proof_cid, timestamp);
        console.log('Node Proof CID stored in round', round)
      } else {
        console.log('CID NOT FOUND');
      }
    } catch (err) {
      console.log('ERROR IN EXECUTING TASK', err);
      return 'ERROR IN EXECUTING TASK' + err;
    }
  }

  async submitTask(roundNumber) {
    console.log('submitTask called with round', roundNumber);
    try {
      console.log('inside try');
      console.log(
        await namespaceWrapper.getSlot(),
        'current slot while calling submit',
      );
      const submission = await this.fetchSubmission(roundNumber);
      console.log('SUBMISSION', submission);
      await namespaceWrapper.checkSubmissionAndUpdateRound(
        submission,
        roundNumber,
      );
      console.log('after the submission call');
      return submission;
    } catch (error) {
      console.log('error in submission', error);
    }
  }

  async fetchSubmission(round) {

    console.log('IN FETCH SUBMISSION');
    const proof_cid = await db.getNodeProofCid(round);
    console.log('Monitor Data CID', proof_cid, "in round", round);

    return proof_cid;
  }
}
const submission = new Submission();
module.exports = { submission };