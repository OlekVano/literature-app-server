import { PrismaClient, Work } from '@prisma/client'
const prisma = new PrismaClient()
import { getRandNumArray, getRandNum, getRandArrayItem, replaceAll, fillPattern, removeDuplicates, getRandArrayItems, shuffleArray } from './utils'
import { WorkProperty } from './types'

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