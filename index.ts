require('dotenv').config()

import { Work } from '@prisma/client'
import prisma from './database'

const express = require('express')
const app = express()
app.use(express.json())
const port = process.env.PORT || 3001

const pickRandomWork = async (count: number): Promise<Work[]> => {
  const itemCount = await prisma.work.count();
  const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count);

  return prisma.work.findMany({
    take: count,
    skip: skip,
  });
}

app.post('/works', async (req: any, res: any) => {
  console.log('POST')
  // const mandatoryParams: string[] = ['name', 'author', 'genre', 'direction', 'theme', 'idea', 'mainCharacters']
  // if (!mandatoryParams.every(key => Object.keys(req.body).includes(key))) {
  //   res.status(400).send({ message: 'One or more parameters were not provided' })
  //   return
  // }
  if (await prisma.work.findFirst({
    where: {name: req.body.name}
  }) != null) {
    res.status(400).send({ message: 'This work has already been added to the database' })
    return
  }
  try {
    const work = await prisma.work.create({ data: req.body })
    res.json(work)
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: err })
  }
})

app.get('/questions/random', async (req: any, res: any) => {
  try {
    const work = (await pickRandomWork(1))[0]
    console.log(work)

    const prohibitedProperties = ['country']
    const possibleProperties = Object.keys(work).filter((key) => !prohibitedProperties.includes(key))
    const chosenProperty = possibleProperties[Math.floor(Math.random() * possibleProperties.length)]




    res.json(work)
  } catch (err) {
    res.code(500).send({ message: err })
  }

  // try {
  //   const userId: string = req.params.userId
  //   const user = await prisma.user.findUnique({
  //     where: { id: userId }
  //   })
  //   if (user == null) {
  //     res.status(400).send({ message: 'User not found' })
  //   }
  //   res.json(user)
  // } catch (err) {
  //   res.code(500).send({ message: err })
  // }
})

app.listen(port, () => {
  console.log( `Server started at http://localhost:${ port }` );
});