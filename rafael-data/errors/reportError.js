import * as Sentry from '@sentry/node'
import { logDanger, logError } from '../helpers/print-log'

export default async function reportError (errorDescription, err = {}) {
  logDanger(`Error: ${errorDescription}`)
  if (err instanceof Error) {
    Sentry.captureException(err)
    let stackTrace = []
    try {
      stackTrace = err.stack.split('\n')
    } catch (_) {}
    err = { errorType: err.constructor.name, stackTrace }
    logError(err)
  } else {
    Sentry.withScope(function (scope) {
      scope.setExtra('data', err)
      Sentry.captureException(new Error(errorDescription))
    })
  }
}
