
export function createPathFromPrevious(previousLink: string) {
  return "/" + previousLink.replaceAll("___", "/")
}