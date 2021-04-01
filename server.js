// import libraries
const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
const routes = require('./routes')

// initialise app
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())
app.use('/', routes)

// set port
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
