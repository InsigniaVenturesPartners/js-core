export function matchFirstRegexGroup(string, regexExpression) {
  if (!string) return null

  const matchResult = string.match(regexExpression)
  if (!matchResult) return null;

  return matchResult[1];
}
