require('dotenv').config()
import * as Works from './works'

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

app.get('/questions/random', cors(corsOptions), async (req: any, res: any) => {
  try {
    res.json(await Works.getRandABCDQuestionV3())
  } catch (err) {
    res.code(500).send({ message: err })
  }
})

app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
  console.log(await Works.getRandABCDQuestionV3())
});