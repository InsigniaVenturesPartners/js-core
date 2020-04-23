import logDanger from './logDanger';

export default function logError(err) {
  let errorResult
  if (err instanceof Error) {
    errorResult = {
      errorMessage: err.message,
      stackTrace: err.stack.split('\n')
    }
  } else {
    errorResult = {
      errorMessage: err
    }
  }
  return logDanger(JSON.stringify(errorResult))
}
