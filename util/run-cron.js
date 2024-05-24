export default async function runCronTask() {
  const cronTaskName = process.argv[process.argv.length - 1];
  const runCronTaskApiSpec = require('../src/api/handlers/Admin/runCronTask').default;
  runCronTaskApiSpec.validate({ cronTaskName });
  return runCronTaskApiSpec.handler({ payload: { cronTaskName } });
}
