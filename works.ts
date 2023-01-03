import prisma from './db'
import { Work } from '@prisma/client'

import { getRandArrItems, removeDuplicates, shuffleArray, getRandNum, fillPattern, getRandArrItem, getKeysValues } from './utils'
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
  const variations: string[] = (await getAllPropVariations(property)).filter(e => e !== '').filter(e => e !== exception)
  const uniqueVariations = removeDuplicates<string>(variations)

  return getRandArrItems<string>(uniqueVariations, n)
}

async function getRandPropVarExcept(property: WorkProperty, exception: string|null = null) {
  return (await getRandPropVarsExcept(property, 1, exception)).flat()
}

async function randomizeWorkProperties(work: Work, properties: WorkProperty[]): Promise<void> {
  for (let property of properties) {
    // @ts-ignore
    work[property] = await getRandPropVarExcept(property, work[property])
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
  const randomQuestionPattern: [WorkProperty, string]  = getRandArrItem<[WorkProperty, string]>(getKeysValues(possibleQuestionPatterns).filter(e => randomWork[e[0]] !== ''))

  const property: WorkProperty = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]

  // @ts-ignore
  const correctAnswer: string = (!(randomWork[property] instanceof Array)) ? randomWork[property] : getRandArrItem<string>(randomWork[property])


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

export async function getRandomCorrectSingleWorkStatementQuestion() {
  const possibleOptionPatterns: {[key in Exclude<WorkProperty, 'mainCharacters'>]: string} = {
    'author': 'Автором твору "%name%" є %author%.',
    'genre': 'Твір "%name%" є жанру %genre%.',
    'direction': 'Твір "%name%" є напряму %direction%.',
    'theme': 'Тема твору "%name%" - %theme%.',
    'idea': 'Ідея твору "%name%" - %idea%.',
  }

  const randWork: Work = await getRandWork()
  // @ts-ignore
  const randomQuestionPatterns: [WorkProperty, string][] = getRandArrItems(getKeysValues(possibleOptionPatterns).filter(e => randWork[e[0]] !== ''), 4)
  shuffleArray(randomQuestionPatterns)

  // @ts-ignore
  const questionPattern: string = randomQuestionPatterns.pop()[1]

  const properties = randomQuestionPatterns.map(e => e[0])

  for (let property of properties) {
    // @ts-ignore
    randWork[property] = (await getRandPropVarsExcept(property, 1, randWork[property]))[0]
  }

  // @ts-ignore
  const correctAnswer: string = fillPattern(questionPattern, randWork)
  const options = [correctAnswer]

  for (let i of randomQuestionPatterns) {
    // @ts-ignore
    options.push(fillPattern(i[1], randWork))
  }

  return {
    question: 'Яке з твердженнь є вірним?',
    options: options,
    answer: correctAnswer
  }
}