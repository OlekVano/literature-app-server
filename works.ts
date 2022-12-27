import prisma from './db'
import { Work } from '@prisma/client'

import { getRandArrayItems, removeDuplicates, shuffleArray, getRandNum, getRandArrayItem, fillPattern } from './utils'
import { WorkProperty } from './types'

export async function getAllWorkIds(): Promise<string[]> {
  return (await prisma.work.findMany({
    select: {id: true},
  })).map(e => e.id)
}

export async function getNumWorks(): Promise<number> {
  return await prisma.work.count()
}

export async function getRandWork(): Promise<Work> {
  const total: number = await getNumWorks()
  const skip: number = getRandNum(total)

  return await prisma.work.findFirstOrThrow({
    skip: skip
  })
}

export async function getRandWorkIds(n: number, excludeId: string|null = null): Promise<string[]> {
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

async function getMultipleWorkPropVars(ids: string[], property: string): Promise<any> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    where: {id: {in: ids}},
    select: selectDict
  })).map(e => e[property])
}

async function getWorkPropVars(property: string): Promise<string[]> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.work.findMany({
    select: selectDict
  })).map(e => e[property]).flat()
}

async function getRandWorkPropVarsExcept(property: string, n: number, exception: string|null = null): Promise<string[]> {
  const variations: string[] = await getWorkPropVars(property)
  const uniqueVariations = removeDuplicates<string>(variations)

  if (exception !== null) uniqueVariations.splice(uniqueVariations.indexOf(exception), uniqueVariations.indexOf(exception))

  return getRandArrayItems<string>(uniqueVariations, 3)
}

export async function getRandomABCDQuestionOld() {
  const randomWorkIds: string[] = await getRandWorkIds(4)

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
  
  const possibleAnswers: string[] = await getMultipleWorkPropVars(randomWorkIds, value)

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

export async function getRandomQuestion() {
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


  const answerOptions = await getRandWorkPropVarsExcept(property, 3, correctAnswer)
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