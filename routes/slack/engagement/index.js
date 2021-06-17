const routes = require('express').Router()
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')
const Airtable = require("airtable");
const e = require('express');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);

routes.post('/update', async (req, res) => {
  // update metrics on airtable's base
  const memberEmails = req.body["memberEmails"]
  const juntoEmails = req.body["juntoEmails"]
  const result = []
  for (let r of memberEmails) {
    let c = 0;
    juntoEmails.forEach((e) => e == r.email? c=c+1 : c=c)
    result.push({
      "id": r.id,
      "email": r.email,
      "juntoCount": c
    })
  }
  for (let r of result) {
    if (r.juntoCount > 0) {
      console.log ("updating for", r.email)
      try {
        await base("Slack Member Engagement").update([
          {
            "id": r.id,
            "fields": {
              "Juntos Created": r.juntoCount
            }
          }
        ])
      } catch (err) {
        console.log ("error", err)
        res.send({
          "ok": false
        })  
      }
    }
  }
  res.send({
    "ok": true
  })  
})

routes.post('/sendMessage', async (req, res) => {
  const data = await _.pick(req.body, [
    'message', 
    'user_id',
    'steward'])

  const stewardTokens = {
    "Angela": process.env.SLACK_USER_TOKEN,
    "Sachin": process.env.SLACK_SACHIN,
    "John": process.env.SLACK_JOHN,
    "Vivek": process.env.SLACK_VIVEK,
    "William": process.env.SLACK_WILLIAM
  }

  const sendFromToken = stewardTokens[data.steward]

  const web = new WebClient(sendFromToken)
  let r = {"ok": false};
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
