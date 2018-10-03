export const camelizer = (underscoredIdentifier) => {
  let camelCased = underscoredIdentifier.replace(
    /_([a-z])/g, 
    (g) => g[1].toUpperCase()
  )
  return camelCased
}