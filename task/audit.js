const { namespaceWrapper } = require('../_koiiNode/koiiNode');
const monitorDataValidate = require('../monitor_data_validate')
class Audit {
  async validateNode(submission_value, round) {
    // Write your logic for the validation of submission value here and return a boolean value in response

    // The sample logic can be something like mentioned below to validate the submission
    let vote;
    console.log('SUBMISSION VALUE', submission_value, round);
    try {
      vote = monitorDataValidate(submission_value)
    } catch (e) {
      console.error(e);
      vote = false;
    }
    return vote;
  }

  async auditTask(roundNumber) {
    console.log('auditTask called with round', roundNumber);
    console.log(
      await namespaceWrapper.getSlot(),
      'current slot while calling auditTask',
    );
    await namespaceWrapper.validateAndVoteOnNodes(
      this.validateNode,
      roundNumber,
    );
  }
}
const audit = new Audit();
module.exports = { audit };