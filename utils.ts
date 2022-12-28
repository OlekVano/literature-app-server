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
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function replaceAll(str: string, pattern: string, replacement: string): string {
  return str.split(pattern).join(replacement)
}

export function fillPattern(questionPattern: string, dict: {[key: string]: string}): string {
  const keys: string[] = Object.keys(dict)

  keys.forEach(key => questionPattern = replaceAll(questionPattern, `%${key}%`, dict[key]))

  return questionPattern
}

export function shuffleArray<T>(arr: T[]): void {
  for (var i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}