const express = require('express')
const { esClient } = require('./elasticsearchClient')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('static'))
app.use(cors())

app.listen(process.env.PORT || 8000, () => {
  console.log('connected')
})

// require('./elasticsearchClient')
require('./routes')(app, esClient)
