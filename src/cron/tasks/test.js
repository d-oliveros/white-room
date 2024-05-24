export default function testCronTask() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.9) {
        reject(new Error('Test error.'));
      }
      else {
        resolve();
      }
    }, 200);
  });
}
