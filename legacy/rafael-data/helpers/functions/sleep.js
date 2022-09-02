export default function sleep(e, ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(e), ms);
  });
}
