const routes = require('express').Router()
const gift = require('./gift')
// const slack = require('./slack')
const juntos = require('./slack/juntos')
const jobs = require('./slack/jobs')
const offers = require('./slack/offers')

routes.use('/gift', gift)
// routes.use('/slack', slack)
routes.use('/juntos', juntos)
routes.use('/jobs', jobs)
routes.use('/offers', offers)

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' })
});

module.exports = routes