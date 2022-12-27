require('dotenv').config()
import * as Works from './works'

const express = require('express')
const app = express()
app.use(express.json())
const port = process.env.PORT || 3001

app.get('/questions/random', async (req: any, res: any) => {
  try {
    // res.json(await getRandomABCDQuestion())
  } catch (err) {
    res.code(500).send({ message: err })
  }
})

app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
  console.log(await Works.getRandomABCDQuestion())
});