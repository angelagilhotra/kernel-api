const routes = require('express').Router()
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')


routes.post('/sendMessage', async (req, res) => {
  const data = await _.pick(req.body, [
    'message', 
    'user_id',
    'steward'])

  const stewardTokens = {
    "Angela": process.env.SLACK_USER_TOKEN,
    "Sachin": process.env.SLACK_SACHIN,
    "John": process.env.SLACK_JOHN,
    "Vivek": process.env.SLACK_VIVEK
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
