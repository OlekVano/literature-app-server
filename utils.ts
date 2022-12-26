export function getRandNum(max: number): number {
  return Math.floor(Math.random() * max)
}
  
export function getRandNumArray(max: number, length: number): number[] {
  const arr: number[] = []
  // Iterate 15 times in order to avoid iterating too many times in case of a bug or anomaly in random
  for (let i = 15; i--;) {
    const n = getRandNum(max)
    if (!arr.includes(n)) arr.push(n)
    if (arr.length >= length) break
  }
  return arr
}