const routes = require('express').Router()
const gift = require('./gift')
const officeHoursWorkflow = require("./slack/officeHours")
const juntos = require('./slack/juntos')
const jobs = require('./slack/jobs')
const offers = require('./slack/offers')
const officeHours = require("./officeHours")
const engagement = require("./slack/engagement")
const housekeeping = require("./housekeeping")

routes.use('/gift', gift)
routes.use('/juntos', juntos)
routes.use('/jobs', jobs)
routes.use('/offers', offers)

routes.use('/officeHours', officeHours)
routes.use('/slack/officeHours', officeHoursWorkflow)
routes.use('/slack/engagement', engagement)

routes.use('/housekeeping', housekeeping)

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' })
});

module.exports = routes