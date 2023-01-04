import prisma from './db'
import { Work } from '@prisma/client'

import { getRandArrItems, removeDuplicates, shuffleArray, getRandNum, fillPattern, getRandArrItem, getKeysValues, fillPatterns, removeEmpty, removeAllMatches, isString } from './utils'
import { WorkProperty } from './types'

async function getAllIds(): Promise<string[]> {
  return (await prisma.work.findMany({
    select: {id: true},
  })).map(e => e.id)
}

async function getTotalNum(): Promise<number> {
  return await prisma.work.count()
}

async function getRandWork(): Promise<Work> {
  const total: number = await getTotalNum()
  const skip: number = getRandNum(total)

  return await prisma.work.findFirstOrThrow({
    skip: skip
  })
}

async function getRandIds(n: number, excludeId: string|null = null): Promise<string[]> {
  const ids: string[] = await getAllIds()
  if (excludeId !== null && ids.includes(excludeId)) {
    ids.splice(ids.indexOf(excludeId), 1)
  }

  return getRandArrItems<string>(ids, n)
}

async function getById(id: string): Promise<Work> {
  return await prisma.work.findUniqueOrThrow({
    where: {id: id}
  })
}

async function getMultiplePropVariations(ids: string[], property: string): Promise<any> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    where: {id: {in: ids}},
    select: selectDict
  })).map(e => e[property])
}

async function getAllPropVariations(property: WorkProperty): Promise<string[]> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    select: selectDict
  })).map(e => e[property]).flat()
}

async function getRandPropVarsExcept(property: WorkProperty, n: number, exception: string|null = null): Promise<string[]> {
  const variations: string[] = await getAllPropVariations(property)
  const uniqueVariations: string[] = removeAllMatches(removeDuplicates(removeEmpty(variations)), exception) as string[]

  return getRandArrItems(uniqueVariations, n)
}

async function getRandPropVarExcept(property: WorkProperty, exception: string|null = null): Promise<string> {
  return (await getRandPropVarsExcept(property, 1, exception))[0]
}

async function randomizeWorkProperties(work: Work, properties: Exclude<WorkProperty, 'mainCharacters'>[]): Promise<void> {
  properties.forEach(async (property) => {
    work[property] = await getRandPropVarExcept(property, work[property] as string)
  })
}

export async function getRandWorkWithProperties(properties: WorkProperty[], exceptions: string[]): Promise<{[key: string]: string}> {
  let randomProperties: any = {}
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    const exception = exceptions[i]
    randomProperties[property] = await getRandPropVarExcept(property, exception)
  }
  return randomProperties as {[key: string]: string}
}

export async function getRandABCDQuestion() {
  const possibleQuestionPatterns: {[key in WorkProperty]: string} = {
    'author': 'Хто є автором твору "%name%"?',
    'genre': 'Якого жанру є твір "%name%"?',
    'direction': 'Якого напряму є твір "%name%"?',
    'theme': 'Яка тема твору "%name%"?',
    'idea': 'Яка ідея твору "%name%"?',
    'mainCharacters': 'Хто є одним з героїв твору "%name%"?'
  }

  const randomWork: Work = await getRandWork()

  const propertiesPatterns: [WorkProperty, string][] = getKeysValues(possibleQuestionPatterns) as [WorkProperty, string][]

  const randomQuestionPattern: [WorkProperty, string] = getRandArrItem<[WorkProperty, string]>(getKeysValues(possibleQuestionPatterns).filter(e => randomWork[e[0]] !== ''))

  const property: WorkProperty = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]

  const correctAnswer: string = isString(randomWork[property]) ? randomWork[property] as string : getRandArrItem(randomWork[property] as string[])


  const answerOptions = await getRandPropVarsExcept(property, 3, correctAnswer)
  answerOptions.push(correctAnswer)
  shuffleArray<string>(answerOptions)

  const question: string = fillPattern(questionPattern, randomWork)

  return {
    question: question,
    options: answerOptions,
    answer: correctAnswer
  }
}

export async function getRandCorrectSingleWorkStatementQuestion() {
  const possibleOptionPatterns: {[key in Exclude<WorkProperty, 'mainCharacters'>]: string} = {
    'author': 'Автором твору є "%author%".',
    'genre': 'Твір є жанру "%genre%".',
    'direction': 'Твір є напряму "%direction%".',
    'theme': 'Тема твору - "%theme%".',
    'idea': 'Ідея твору - "%idea%".'
  }

  const randWork: Work = await getRandWork()
  const randomQuestionPatterns: [Exclude<WorkProperty, 'mainCharacters'>, string][] = getRandArrItems(getKeysValues(possibleOptionPatterns).filter(e => randWork[e[0]] !== ''), 4)

  const questionPattern: [Exclude<WorkProperty, 'mainCharacters'>, string] | undefined = randomQuestionPatterns.pop()
  if (questionPattern == undefined) return

  const properties = randomQuestionPatterns.map(e => e[0])
  await randomizeWorkProperties(randWork, properties)
  const correctAnswer: string = fillPattern(questionPattern[1], randWork)
  
  const options = fillPatterns(randomQuestionPatterns.map(e => e[1]), randWork)
  options.push(correctAnswer)
  shuffleArray(options)

  return {
    question: `Яке з твердженнь про твір "${randWork.name}" є вірним?`,
    options: options,
    answer: correctAnswer
  }
}

export async function getRandQuestion() {
  const questionFunctions = [
    getRandABCDQuestion,
    getRandCorrectSingleWorkStatementQuestion
  ]

  return await getRandArrItem(questionFunctions)()
}