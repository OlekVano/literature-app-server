import prisma from './db'
import { Work } from '@prisma/client'

import { getRandArrItems, removeDuplicates, shuffleArray, getRandNum, getRandArrItem, fillPattern } from './utils'
import { WorkProperty } from './types'

export async function getAllIds(): Promise<string[]> {
  return (await prisma.work.findMany({
    select: {id: true},
  })).map(e => e.id)
}

export async function getTotalNum(): Promise<number> {
  return await prisma.work.count()
}

export async function getRandWork(): Promise<Work> {
  const total: number = await getTotalNum()
  const skip: number = getRandNum(total)

  return await prisma.work.findFirstOrThrow({
    skip: skip
  })
}

export async function getRandIds(n: number, excludeId: string|null = null): Promise<string[]> {
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

async function getAllPropVariations(property: string): Promise<string[]> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    select: selectDict
  })).map(e => e[property]).flat()
}

async function getRandPropVarsExcept(property: string, n: number, exception: string|null = null): Promise<string[]> {
  const variations: string[] = await getAllPropVariations(property)
  const uniqueVariations = removeDuplicates<string>(variations)

  if (exception !== null) uniqueVariations.splice(uniqueVariations.indexOf(exception), uniqueVariations.indexOf(exception))

  return getRandArrItems<string>(uniqueVariations, 3)
}

export async function getRandABCDQuestionOld() {
  const randomWorkIds: string[] = await getRandIds(4)

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
  
  const possibleAnswers: string[] = await getMultiplePropVariations(randomWorkIds, value)

  // @ts-ignore
  const mainWorkId: string = randomWorkIds.pop()
  const mainWork: Work = await getById(mainWorkId)

  // @ts-ignore
  const question: string = fillPattern(questionPattern, mainWork)
  const correctAnswer = mainWork[value]

  return {
    question: question,
    options: possibleAnswers,
    answer: correctAnswer
  }
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

  // @ts-ignore
  const randomQuestionPattern: [WorkProperty, string]  = getRandArrayItem<[WorkProperty, string]>(Object.entries(possibleQuestionPatterns))
  const property: WorkProperty = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]

  // @ts-ignore
  const correctAnswer: string = (!(randomWork[property] instanceof Array)) ? randomWork[property] : getRandArrayItem<string>(randomWork[property])


  const answerOptions = await getRandPropVarsExcept(property, 3, correctAnswer)
  answerOptions.push(correctAnswer)
  shuffleArray<string>(answerOptions)

  // @ts-ignore
  const question: string = fillPattern(questionPattern, randomWork)

  return {
    question: question,
    options: answerOptions,
    answer: correctAnswer
  }
}