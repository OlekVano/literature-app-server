import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Server start')
  // var works = await prisma.work.findMany()
  // console.log(works)
  // await prisma.work.deleteMany()
  // works = await prisma.work.findMany()
  // console.log(works)
}

main()
  .catch(e => {
    console.error(e.message)
  }).finally(async () => {
    await prisma.$disconnect()
  })

export default prisma