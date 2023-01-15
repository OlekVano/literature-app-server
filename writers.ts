import { Writer } from '@prisma/client'
import prisma from './db'
import { AskableWriterProperty } from './types'

import { fillPattern, getKeysValues, getRandArrItem, getRandArrItems, getRandNum, isEmpty, isString, removeAllMatches, removeDuplicates, removeEmpty, shuffleArray } from './utils'

export async function getAllIds(): Promise<string[]> {
  return (await prisma.writer.findMany({
    select: {id: true},
  })).map(e => e.id)
}

export async function getTotalNum(): Promise<number> {
  return await prisma.writer.count()
}

export async function getRand(): Promise<Writer> {
  const total: number = await getTotalNum()
  const skip: number = getRandNum(total)

  return await prisma.writer.findFirstOrThrow({
    skip: skip
  })
}

async function getAllPropVariations(property: AskableWriterProperty): Promise<string[]> {
  const selectDict: {[key: string]: boolean} = {}
  selectDict[property] = true
  return (await prisma.writer.findMany({
    select: selectDict
  })).map(e => e[property]).flat()
}

async function getRandPropVarsExcept(property: AskableWriterProperty, n: number, exceptions: string[]|string): Promise<string[]> {
  const variations: string[] = await getAllPropVariations(property)
  const uniqueVariations: string[] = removeAllMatches(removeDuplicates(removeEmpty(variations)), exceptions)
  return getRandArrItems(uniqueVariations, n)
}

export async function getRandABCDQuestion() {
  const possibleQuestionPatterns: {[key in AskableWriterProperty]: string} = {
    'pseudonym': 'Під яким псевдонімом відомий %name%?',
    'photoUrl': 'На якому з портретів зображений %pseudonym%?',
    'works': 'Який з наступних творів написав %pseudonym%?'
  }

  const randWriter: Writer = await getRand()
  if (randWriter.pseudonym == '') randWriter.pseudonym = randWriter.name

  const propertiesPatters: [AskableWriterProperty, string][] = getKeysValues(possibleQuestionPatterns)

  const randomQuestionPattern: [AskableWriterProperty, string] = getRandArrItem(getKeysValues(possibleQuestionPatterns).filter(e => !isEmpty(randWriter[e[0]])))

  const property: AskableWriterProperty = randomQuestionPattern[0]
  const questionPattern: string = randomQuestionPattern[1]

  const correctAnswer: string = isString(randWriter[property]) ? randWriter[property] as string : getRandArrItem(randWriter[property] as string[])

  const answerOptions = await getRandPropVarsExcept(property, 3, randWriter[property])
  answerOptions.push(correctAnswer)
  shuffleArray(answerOptions)

  const question: string = fillPattern(questionPattern, randWriter)

  return {
    question: question,
    options: answerOptions,
    answer: correctAnswer
  }
}

export async function getRandQuestion() {
  const questionFunctions = [
    getRandABCDQuestion
  ]

  return await getRandArrItem(questionFunctions)()
}