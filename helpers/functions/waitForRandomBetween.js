export default function waitForRandomBetween (min = 1, max = 5) {
  return new Promise(resolve => {
    const randMs = Math.floor(Math.random() * (max - min + 1)) + min
    setTimeout(() => resolve(true), (randMs * 1000))
  })
}
