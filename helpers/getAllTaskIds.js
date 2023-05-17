const { PublicKey } = require('@_koi/web3.js');

const MINIMUM_ACCEPTED_LENGTH_TASK_CONTRACT = 500;

async function getAllTaskIds(connection) {
  let taskAccountInfo = await connection.getProgramAccounts(
    new PublicKey(
      process.env.TASK_CONTRACT_ID ||
      'Koiitask22222222222222222222222222222222222',
    ),
  );
  if (taskAccountInfo === null) {
    throw 'Error: cannot find the task contract data';
  }
  const tasks = taskAccountInfo
    .filter((e) => e.account.data.length > MINIMUM_ACCEPTED_LENGTH_TASK_CONTRACT && isValidTask(e.account.data))
    .map((e) => ({
      name: JSON.parse(e.account.data.toString()).task_name,
      taskId: e.pubkey.toBase58(),
      executable: JSON.parse(e.account.data.toString()).task_audit_program,
      is_active: JSON.parse(e.account.data.toString()).is_active,
      is_whitelisted: JSON.parse(e.account.data.toString()).is_whitelisted,
    }));
  return tasks.map((task) => task.taskId)
}
function isValidTask(data) {
  try {
    const taskData = JSON.parse(data);
    if (!taskData.task_name) {
      return false
    }
    // if (taskData.is_active && taskData.is_whitelisted) {
    //   return true;
    // } else {
    //   console.log(`${taskData.task_name} is not active or whitelisted`);
    //   return true;
    // }
    return true
  } catch (e) {
    return false;
  }
}

module.exports = getAllTaskIds;
