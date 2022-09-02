export default function getLinkedinUsername (linkedinURL) {
  if (!linkedinURL || !linkedinURL.toLowerCase().includes('linkedin')) return null
  const urlParts = linkedinURL
    .toLowerCase()
    .split('?')[0] // remove query string
    .trim()
    .replace(/\/$/, '') // remove trailing
    .split('/')

  if (urlParts.length === 0) return null
  return urlParts[urlParts.length - 1]
}
