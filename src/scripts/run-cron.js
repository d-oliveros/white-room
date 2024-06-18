import runCronTaskApiSpec from '#api/handlers/Admin/runCronTask.js';

export default async function runCronTask() {
  const cronTaskName = process.argv[process.argv.length - 1];
  runCronTaskApiSpec.validate({ cronTaskName });
  return runCronTaskApiSpec.handler({ payload: { cronTaskName } });
}
