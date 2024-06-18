export default function testCronTask() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.9) {
        reject(new Error('Testing cron error.'));
      }
      else {
        resolve();
      }
    }, 200);
  });
}
