export function sleepRandomly(maxTime) {
  return new Promise((resolve) => {
    setTimeout(resolve, (Math.random() * maxTime * 1000));
  });
}
