export function getRandNum(max: number): number {
  return Math.floor(Math.random() * max)
}
  
export function getRandNumArray(max: number, length: number): number[] {
  const arr: number[] = []
  // Iterate a maximum of 60 times in order to avoid iterating too many times in case of a bug or anomaly in random
  for (let i = 60; i--;) {
    const n = getRandNum(max)
    if (!arr.includes(n)) arr.push(n)
    if (arr.length >= length) break
  }
  return arr
}

export function getRandArrItem<T>(arr: T[]): T {
  return arr[getRandNum(arr.length)]
}

export function getRandArrItems<T>(arr: T[], n: number): T[] {
  const indexes: number[] = getRandNumArray(arr.length, n)
  return indexes.map(index => arr[index])
}

export function removeDuplicates<T>(arr: T[]): T[] {
  return arr.filter((item, index) => arr.indexOf(item) === index)
}

export function replaceAll(str: string, pattern: string, replacement: string): string {
  return str.split(pattern).join(replacement)
}

export function fillPattern<T extends string | number | symbol>(questionPattern: string, dict: {[key in T]: string | string[]}): string {
  const keys: T[] = Object.keys(dict) as T[]
  keys.forEach(key => questionPattern = replaceAll(questionPattern, `%${key as string}%`, dict[key] as string))
  return questionPattern
}

export function fillPatterns<T extends string | number | symbol>(patterns: string[], dict: {[key in T]: string | string[]}): string[] {
  const filledPatterns: string[] = []
  patterns.forEach(pattern => filledPatterns.push(fillPattern(pattern, dict)))
  return filledPatterns
}

export function shuffleArray<T>(arr: T[]): void {
  for (var i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(getRandNum(i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

export function getKeys<T extends string | number | symbol>(dict: {[key in T]: unknown}): T[] {
  return Object.keys(dict) as T[]
}

export function getKeysValues<T extends string | number | symbol, Y>(dict: {[key in T]: Y}): [T, Y][] {
  return Object.entries(dict) as [T, Y][]
}

export function isEmpty(e: string | unknown[]) {
  return e.length === 0
}

export function removeEmpty<T>(arr: T[]): T[] {
  return arr.filter(e => e !== '')
}

export function removeAllMatches<T>(arr: T[], match: T): T[] {
  return arr.filter(e => e !== match)
}

export function removeArrItem<T>(arr: T[], item: T): void {
  arr.splice(arr.indexOf(item), 1)
}

export function isString(x: any) {
  return Object.prototype.toString.call(x) === "[object String]"
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}