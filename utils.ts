function randomNum(max: number): number {
  return Math.floor(Math.random() * max)
}
  
export function getRandomNumArray(max: number, length: number): number[] {
  const arr: number[] = []
  // Iterate 15 times in order to avoid iterating too many times in case of a bug or anomaly in random
  for (let i = 15; i--;) {
    const n = randomNum(max)
    if (!arr.includes(n)) arr.push(n)
    if (arr.length >= length) break
  }
  return arr
}