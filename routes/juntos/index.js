const routes = require('express').Router()
const { blocks } = require('./new_junto.json')
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')
const token = process.env.SLACK_BOT_TOKEN
const web = new WebClient(token)
// const { airtable } = require('../../credentials.json')
const Airtable = require("airtable");
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);
const base_rsvp_url = "https://juntos.kernel.community"

/**
 * Create a new junto
 * expects event details, event id and record id
 * sends a slack message with a button to RSVP
 * updates airtable table with slack message's timestamp
 */
routes.post('/new', async (req, res) => {
  const data = _.pick(req.body, [
    'event_details', 
    'event_id', 
    'record_id'])
  const rsvp_url = base_rsvp_url + "/rsvp/" + data.record_id

  let description = data.event_details.description ? data.event_details.description : ""

  description = data.event_details.description.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g," ")
  let title = data.event_details.title ? data.event_details.title.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g,"") : ""

  if (description.length > 200) {
    description = description.substring(0,200) + "..."
  }
  // console.log ("description:", description);
  let message_blocks = JSON.stringify(blocks)
  message_blocks = message_blocks
    .replace("<junto_proposer>", data.event_details.proposer? data.event_details.proposer : "")
    .replace("<junto_title>", title)
    .replace("<junto_description>", description)
    .replace("<rsvp_url>", rsvp_url)
  // let r = {ok: true}
  try {
    r = await web.chat.postMessage({channel: "#kernel-juntos", "blocks": message_blocks})
  } catch (err) {
    console.log (err)
  }

  if (r.ok) {
    res.send({
      "ts": r.ts
    })
  } else {
    res.send({
      "ok": false
    })
  }
});

/**
 * RSVP to a junto
 * updates airtable "attendees" field
 */
// routes.get('/rsvp/:eventId/:recordId', async (req, res) => {
//   // @todo 

//   /**
//    * Display a web page with all the details of the event => details fetched using recordId from airtable
//    * an option to rsvp - enter email => updates "attendees" field in airtable
//    * 
//    */
// })

/**
 * Receives POST req from slack app button action
 */
routes.post('/', (req, res) => {
  res.status(200).json({ message: 'Connected!' })
});

module.exports = routes
