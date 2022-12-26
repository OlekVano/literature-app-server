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

export function getRandArrayItem<T>(arr: T[]): T {
  return arr[getRandNum(arr.length)]
}

export function replaceAll(str: string, pattern: string, replacement: string): string {
  return str.split(pattern).join(replacement)
}

export function fillPattern(questionPattern: string, dict: {[key: string]: string}): string {
  const keys: string[] = Object.keys(dict)

  keys.forEach(key => questionPattern = replaceAll(questionPattern, `%${key}%`, dict[key]))

  return questionPattern
}