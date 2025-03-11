export function debounce<Args extends unknown[], R>(
  func: (...args: Args) => Promise<R>,
  wait: number,
): (...args: Args) => Promise<R> {
  let timeoutId: NodeJS.Timeout;

  return (...args: Args): Promise<R> => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        try {
          const result = func(...args);
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }, wait);
    });
  };
}
