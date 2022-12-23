const routes = require('express').Router()
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')
const token = process.env.SLACK_OFFERS_BOT_TOKEN
const web = new WebClient(token)
const {view} = require("./modal.json")
const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(
  process.env.AIRTABLE_BASE_KEY
);

const table = "Offers"

routes.post("/new", async(req, res) => {
  if (req.body["challenge"]) {
    res.status(200).send({"challenge": req.body["challenge"]})
  }
  if (req.body["event"]) {
    // console.log("---event received---")
    const event = req.body["event"]
    const inputs = event["workflow_step"]["inputs"]
    const offer = {
      name: inputs["name"].value,
      description: inputs["offer_description"].value,
      link_to_scheduler: inputs["link_to_scheduler"].value,
      email: inputs["email"].value
    }
    base(table).create([
      {
        "fields": {
          "Name": offer.name,
          "Offer": offer.description,
          "Link to Scheduler": offer.link_to_scheduler,
          "email": offer.email
        }
      }
    ], function (err, records) {
      if (err) {
        console.log("error in airtable:",err)
        res.status(500).send("ERROR")
      }
      records.forEach(function(record){
        console.log("record added:",record.getId())
      })
      res.status(200).send({"challenge": req.body.challenge})
    })
  }
})

routes.post ("/configure", async(req,res) => {
  // console.log (req)
  const _p = _.pick(req.body, 'payload')
  const payload = JSON.parse(_p["payload"])
  // console.log (payload)

  if (payload["type"] == "workflow_step_edit") {
    // console.log ("starting workflow edit")
    // console.log (payload)
    trigger_id = payload["trigger_id"]
    // console.log("trigger_id:",trigger_id)
    try {
      await web.views.open({
        trigger_id,
        view
      })
      res.status(200).send("OK")
    } catch (err) {
      console.log (err)
      res.status(500).send("ERROR")
    }
  }

  if (payload["type"] == "view_submission") {
    // console.log ("saving config")
    // console.log (payload["view"])
    const state = payload["view"]["state"]["values"]
    // console.log ("state")
    // console.log(state)

    let inputs = {};
    for (const s in state) {
      const _in = state[s]
      for (const _i in _in) {
        inputs[_i] = _in[_i]
      }
    }
    // console.log (inputs)
    try {
      await web.workflows.updateStep({
        workflow_step_edit_id: payload["workflow_step"]["workflow_step_edit_id"],
        inputs
      })
      res.status(200).send({})
    } catch(err) {
      console.log(err)
      res.status(500).send("ERROR")
    }
  }
})

module.exports = routes
