import { Writer } from '@prisma/client'
import prisma from './db'

import { getRandNum } from './utils'

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