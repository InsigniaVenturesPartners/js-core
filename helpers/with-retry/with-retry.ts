import { logInfo } from "@insigniateam/helpers.print-log";

export async function withRetry (fn, {
  altFn = null,
  delayBetweenAttempt = 0, // in seconds
  useExponentialDelay = true,
  maxRetry = 10,
  attempt = 0
} = {}) {
  let waitTime = attempt > 0 ? delayBetweenAttempt * 1000 : 0
  if (useExponentialDelay && delayBetweenAttempt === 0) {
    waitTime = attempt > 0 ? Math.pow(2, attempt) * 1000 : 0
    waitTime = waitTime > 32 * 1000 ? 32 * 1000 : waitTime
  }
  if (attempt > 0) logInfo(`Retrying ${attempt}/${maxRetry} in ${waitTime / 1000}s..`)
  return new Promise(resolve => setTimeout(resolve, waitTime))
    .then(() => {
      if (altFn && attempt % 2 === 1) {
        return altFn(attempt)
      }
      return fn(attempt)
    })
    .catch(e => {
      attempt++
      if (attempt > maxRetry) {
        throw new Error(`Max retry reached. Skipping.. Last error: ${e.stack}`)
      } else {
        return withRetry(fn, { altFn, delayBetweenAttempt, useExponentialDelay, attempt, maxRetry })
      }
    })
}
