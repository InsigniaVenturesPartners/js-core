export default function standardizeLinkedinUrl(sourceUrl) {
  if (!sourceUrl) return null

  let url = sourceUrl
    .toLowerCase()
    .split("?")[0] // remove query string
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
  url = url.replace("linkedin.com", "")
  const urlSplit = url.split("/")
  if (urlSplit[1].trim() === "in" && urlSplit.length > 2) {
    return "https://www.linkedin.com/in/" + urlSplit[2].trim()
  }
  if (urlSplit[1].trim() === "company" && urlSplit.length > 2) {
    return "https://www.linkedin.com/company/" + urlSplit[2].trim()
  }
  return null
}
