require('dotenv').config()
import { getRandArrItem } from './utils'
import * as Works from './works'
import * as Writers from './writers'

const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 3001

const corsOptions = {
  //origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

async function getRandQuestion() {
  const questionFunctions = [
    Works.getRandQuestion,
    Writers.getRandQuestion
  ]

  return await getRandArrItem(questionFunctions)()
}



app.get('/questions/random', cors(corsOptions), async (req: any, res: any) => {
  try {
    res.json(await getRandQuestion())
  } catch (err) {
    res.status(500).send({ message: err })
  }
})

app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
  console.log(await getRandQuestion())
});