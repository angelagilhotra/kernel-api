const routes = require('express').Router()
const _ = require('lodash')
const { WebClient } = require('@slack/web-api')
const token = process.env.SLACK_JOBS_BOT_TOKEN
const web = new WebClient(token)
const {view} = require("./modal.json")
const Airtable = require("airtable");

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY);

routes.post("/new", async(req, res) => {
  if (req.body["challenge"]) {
    res.status(200).send({"challenge": req.body["challenge"]})
  }
  if (req.body["event"]) {
    // console.log("---event received---")
    const event = req.body["event"]
    const inputs = event["workflow_step"]["inputs"]
    const job = {
      title: inputs["title"].value,
      company_name: inputs["company_name"].value,
      url: inputs["job_url"].value,
      contact_person_name: inputs["contact_person_name"].value,
      contact_person_email: inputs["contact_person_email"].value,
      location: inputs["job_location"].value,
      type: inputs["job_type"].value
    }
    // console.log  (inputs)
    // console.log ("---")
    // console.log(job)
    
    base("Jobs").create([
      {
        "fields": {
          "Title": job.title,
          "Company Name": job.company_name,
          "Contact Person Name (Slack User)": job.contact_person_name,
          "Contact Person Email (Slack User)": job.contact_person_email,
          "Job URL": job.url,
          "Location": job.location,
          "Job type": job.type
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
