export default function serializeQueryString (obj) {
  if (!obj) return ''
  return '?' + Object.keys(obj).reduce(function (a, k) {
    if (Array.isArray(obj[k])) {
      for (let val of obj[k]) {
        a.push(k + '[]=' + encodeURIComponent(val))
      }
    } else {
      a.push(k + '=' + encodeURIComponent(obj[k]))
    }
    return a
  }, []).join('&')
}
