const routes = require('express').Router()
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')
const token = process.env.SLACK_USER_TOKEN
const web = new WebClient(token)

const Airtable = require("airtable");
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);


/**
 * Create a new junto
 * expects event details, event id and record id
 * sends a slack message with a button to RSVP
 * updates airtable table with slack message's timestamp
 */
routes.post('/sendMessage', async (req, res) => {
  const data = _.pick(req.body, [
    'message', 
    'user_id'])
  try {
    r = await web.chat.postMessage({channel: data.user_id, text: data.message})
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

module.exports = routes
