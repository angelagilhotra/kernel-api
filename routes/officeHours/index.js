const routes = require('express').Router()
// const _ = require('lodash')
// const { WebClient } = require('@slack/web-api')
// const token = process.env.SLACK_OFFERS_BOT_TOKEN
// const web = new WebClient(token)
const Airtable = require("airtable")
const { fetchFellowByEmail, fetchAdventureFromFellowPage } = require('./helpers')
const helpers = require("./helpers")

const base = new Airtable({apiKey: process.env.AIRTABLE_KB3_BASE_KEY}).base(helpers.AirtableKindleTable)


routes.post("/fetchAdventure", async(req,res) => {
  let email = req.body["fellow_email"]
  let fellowPage = await fetchFellowByEmail(helpers.FellowsDB,email)
  if (fellowPage["error"]) res.status(500).send({})
  let adventure = await fetchAdventureFromFellowPage(fellowPage)
  if (adventure["error"]) res.status(500).send({})
  let adventureLink = await helpers.generateNotionProfileLink(adventure.title, adventure.id)
  // console.log ("adventure link:", adventureLink)
  // console.log ("Adventure title", adventure.title)
  res.status(200).send({
    "name": adventure.title,
    "link": adventureLink
  })
})


module.exports = routes
