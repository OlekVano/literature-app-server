import { Writer } from '@prisma/client'
import prisma from './db'

import { getRandArrayItems, removeDuplicates, shuffleArray, getRandNum, getRandArrayItem, fillPattern } from './utils'

export async function getAllWritersIds(): Promise<string[]> {
  return (await prisma.writer.findMany({
    select: {id: true},
  })).map(e => e.id)
}

export async function getNumWorks(): Promise<number> {
  return await prisma.writer.count()
}

export async function getRandWork(): Promise<Writer> {
  const total: number = await getNumWorks()
  const skip: number = getRandNum(total)

  return await prisma.writer.findFirstOrThrow({
    skip: skip
  })
}