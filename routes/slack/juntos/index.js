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
 * Update attendees of a junto, given record id
 * return record id
 */
routes.post('/updateAttendees', async(req, res) => {
	const data=_.pick(req.body, [
		'attendee',
		'record_id'
	])
	let r = await base('Juntos').find(data.record_id[0]);
	let attendees = r.fields['Attendees']
	attendees = attendees + ", " + data.attendee[0];
	await base('Juntos').update([{
		id: data.record_id[0],
		fields: {
			'Attendees': attendees
		}
	}])
	res.send({
		"ok": true
	})
})

/**
 * Creates a new junto in the juntos table on airtable
 * returns record id
 */
routes.post('/submit', async(req,res) => {
	// console.log (req.body)
	const data = _.pick(req.body, [
		'event_details',
		'creator_name',
		'creator',
		'limit',
		'post_on_slack',
		'interview'
	])
	let description = data.event_details.description ? data.event_details.description : ""
  let title = data.event_details.title ? data.event_details.title : ""
	let start = data.event_details.start
	let end = data.event_details.end
	let location = data.event_details.location ? data.event_details.location : ""
	description = description.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g," ")
  title = title.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g,"")
	let r;
	try {
		r = await base('Juntos').create([
			{
				"fields": {
					"Title": title,
					"Start": new Date(start),
					"End": new Date(end),
					"Creator": data.creator,
					"Description": description,
					"Attendees": data.creator,
					"Hangouts Link": location,
					"Creator's Name": data.creator_name,
					"Limit": new Number(data.limit),
					"Post on Slack": data.post_on_slack,
					"Interview": data.interview
				}
			}
		])
	} catch (err) {
		console.log (err)
	}
	// console.log (r)
	res.send({
		"ok": true,
		"juntoUrl": "https://juntos.kernel.community/rsvp/"+r[0].id,
		"juntoRecordId": r[0].id
	})
})

/**
 * Sends a new junto on Slack
 * expects event details, event id and record id
 * sends a slack message with a button to RSVP
 * updates airtable table with slack message's timestamp
 * return timestamp
 */
routes.post('/new', async (req, res) => {
  const data = _.pick(req.body, [
    'event_details', 
    'event_id', 
    'record_id',
		'post_on_slack'])
  const rsvp_url = base_rsvp_url + "/rsvp/" + data.record_id
	let postOnSlack = data.post_on_slack == 0 ? false : true
  let description = data.event_details.description ? data.event_details.description : ""
  let title = data.event_details.title ? data.event_details.title : ""
  let proposer = data.event_details.proposer? data.event_details.proposer : ""
  
  description = description.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g," ")
  title = title.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g,"")
  proposer = proposer.replace(/[&\/\\#,+()$~%.'":*?<>@^{}]/g,"")

  if (description.length > 200) {
    description = description.substring(0,200) + "..."
  }
  // console.log ("description:", description);
  let message_blocks = JSON.stringify(blocks)
  message_blocks = message_blocks
    .replace("<junto_proposer>", proposer)
    .replace("<junto_title>", title)
    .replace("<junto_description>", description)
    .replace("<rsvp_url>", rsvp_url)
  
	let r;
	if (postOnSlack) {
		try {
			r = await web.chat.postMessage({channel: "#kernel-juntos", "blocks": message_blocks})
		} catch (err) {
			console.log (err)
		}
	} else {
		// nothing
		r = { noPost: true }
	}
  

  if (r.ok) {
    res.send({
      "ts": r.ts
    })
  } else if (r.noPost) {
		res.send({
			"ts": 0,
			"juntoUrl": rsvp_url
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
