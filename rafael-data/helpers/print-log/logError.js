import logDanger from './logDanger';

export default function logError(err) {
  let errorResult
  if (err instanceof Error) {
    let stackTrace = []
    try {
      stackTrace = err.stack.split('\n')
    } catch (_) {}
    errorResult = { errorMessage: err.message, stackTrace: stackTrace }
  } else {
    errorResult = { errorMessage: err }
  }
  return logDanger(JSON.stringify(errorResult))
}
