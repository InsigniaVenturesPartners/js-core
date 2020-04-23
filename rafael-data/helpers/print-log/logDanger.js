export default function logDanger(msg) {
  console.error('\x1b[31m%s\x1b[0m', msg)
}
