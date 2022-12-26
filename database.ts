import { PrismaClient, Work } from '@prisma/client'
const prisma = new PrismaClient()
import { getRandNumArray, getRandNum, getRandArrayItem, replaceAll, fillPattern, removeDuplicates, getRandArrayItems, shuffleArray } from './utils'
import { WorkProperty } from './types'

export async function getAllWorkIds(): Promise<string[]> {
  return (await prisma.work.findMany({
    select: {id: true},
  })).map(e => e.id)
}

export async function getAllAuthorIds(): Promise<string[]> {
  return (await prisma.writer.findMany({
    select: {id: true}
  })).map(e => e.id)
}

export async function getNumWorks(): Promise<number> {
  return await prisma.work.count()
}

export async function getRandomWork(): Promise<Work> {
  const total: number = await getNumWorks()
  const skip: number = getRandNum(total)

  return await prisma.work.findFirstOrThrow({
    skip: skip
  })
}

export async function getRandomWorkIds(n: number, excludeId: string|null = null): Promise<string[]> {
  const ids: string[] = await getAllWorkIds()
  if (excludeId !== null && ids.includes(excludeId)) {
    ids.splice(ids.indexOf(excludeId), 1)
  }

  return getRandArrayItems<string>(ids, n)
}

async function getWorkById(id: string): Promise<Work> {
  return await prisma.work.findUniqueOrThrow({
    where: {id: id}
  })
}

async function getMultipleWorksValues(ids: string[], value: string): Promise<any> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[value] = true
  return (await prisma.work.findMany({
    where: {id: {in: ids}},
    select: selectDict
  })).map(e => e[value])
}

async function getWorkPropertyVariations(property: string): Promise<string[]> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    select: selectDict
  })).map(e => e[property])
}

async function getRandWorkPropertyVariationsExcept(property: string, n: number, exception: string|null = null): Promise<string[]> {
  const variations: string[] = await getWorkPropertyVariations(property)
  const uniqueVariations = removeDuplicates<string>(variations)

  if (exception !== null) uniqueVariations.splice(uniqueVariations.indexOf(exception), uniqueVariations.indexOf(exception))

  return getRandArrayItems<string>(uniqueVariations, 3)
}

export async function getRandomABCDQuestionOld() {
  const randomWorkIds: string[] = await getRandomWorkIds(4)

  const possibleQuestionPatterns: {[key in Exclude<WorkProperty, 'mainCharacters'>]: string} = {
    'author': 'Хто є автором твору "%name%"?',
    'genre': 'Якого жанру є твір "%name%"?',
    'direction': 'Якого напряму є твір "%name%"?',
    'theme': 'Яка тема твору "%name%"?',
    'idea': 'Яка ідея твору "%name%"?',
  }
  // @ts-ignore
  const randomQuestionPattern: [Exclude<WorkProperty, 'mainCharacters'>, string]  = getRandArrayItem<[Exclude<WorkProperty, 'mainCharacters'>, string]>(Object.entries(possibleQuestionPatterns))
  const value: Exclude<WorkProperty, 'mainCharacters'> = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]
  
  const possibleAnswers: string[] = await getMultipleWorksValues(randomWorkIds, value)

  // @ts-ignore
  const mainWorkId: string = randomWorkIds.pop()
  const mainWork: Work = await getWorkById(mainWorkId)

  // @ts-ignore
  const question: string = fillPattern(questionPattern, mainWork)
  const correctAnswer = mainWork[value]

  return {
    question: question,
    options: possibleAnswers,
    answer: correctAnswer
  }
}

export async function getRandomABCDQuestion() {
  const possibleQuestionPatterns: {[key in Exclude<WorkProperty, 'mainCharacters'>]: string} = {
    'author': 'Хто є автором твору "%name%"?',
    'genre': 'Якого жанру є твір "%name%"?',
    'direction': 'Якого напряму є твір "%name%"?',
    'theme': 'Яка тема твору "%name%"?',
    'idea': 'Яка ідея твору "%name%"?',
  }

  const randomWork: Work = await getRandomWork()

  // @ts-ignore
  const randomQuestionPattern: [Exclude<WorkProperty, 'mainCharacters'>, string]  = getRandArrayItem<[Exclude<WorkProperty, 'mainCharacters'>, string]>(Object.entries(possibleQuestionPatterns))
  const property: Exclude<WorkProperty, 'mainCharacters'> = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]

  const correctAnswer = randomWork[property]

  const answerOptions = await getRandWorkPropertyVariationsExcept(property, 3, correctAnswer)
  answerOptions.push(correctAnswer)
  shuffleArray(answerOptions)

  // @ts-ignore
  const question: string = fillPattern(questionPattern, randomWork)

  return {
    question: question,
    options: answerOptions,
    answer: correctAnswer
  }
}





async function main(): Promise<void> {
  console.log('Server start')
}

main()
  .catch(e => {
    console.error(e.message)
  }).finally(async () => {
    await prisma.$disconnect()
  })

export default prisma