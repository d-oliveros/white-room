export default function sleepAsync(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
