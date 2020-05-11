export default function matchRegex(string, regexExpression) {
  if (!string) return null;
  if (!string.match(regexExpression)) return null;
  return string.match(regexExpression)[1];
}
