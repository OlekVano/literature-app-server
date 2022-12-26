require('dotenv').config()
import { getRandomABCDQuestion } from './db'

const express = require('express')
const app = express()
app.use(express.json())
const port = process.env.PORT || 3001

app.get('/questions/random', async (req: any, res: any) => {
  try {

    res.json(await getRandomABCDQuestion())
  } catch (err) {
    res.code(500).send({ message: err })
  }
})

app.listen(port, () => {
  console.log( `Server started at http://localhost:${ port }` );
});