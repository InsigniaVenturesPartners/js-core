import axios from 'axios'

export async function getResolvedUrl (url) {
  try {
    const resp = await axios.head(url, { timeout: 3 * 1000, maxRedirects: 0, validateStatus: () => true })
    if (resp.headers.location && resp.headers.location[0] === '/') return url.replace(/\/$/, '') + resp.headers.location
    return resp.headers.location && resp.headers.location !== url ? getResolvedUrl(resp.headers.location) : url
  } catch (_) {
    return url
  }
}
