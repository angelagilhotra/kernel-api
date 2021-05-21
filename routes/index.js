const routes = require('express').Router()
const gift = require('./gift')
const slack = require('./slack')
const juntos = require('./juntos')

routes.use('/gift', gift)
// routes.use('/slack', slack)
routes.use('/juntos', juntos)

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' })
});

module.exports = routes