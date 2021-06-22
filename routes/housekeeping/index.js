/**
 * keeps mentor responses from typeform<>airtable & notion in sync
 */
const routes = require('express').Router()
const notionClient = require("@notionhq/client").Client
const notion = new notionClient({ auth: process.env.NOTION_VIVEK_GITCOIN })
const Airtable = require("airtable")
const helpers = require("./helpers")
const base = new Airtable({apiKey: process.env.AIRTABLE_KB3_BASE_KEY}).base(helpers.AirtableMentorsTable)
const _ = require('lodash')

routes.post("/updateMentorOnNotion", async(req,res) => {

  const data = _.pick(req.body, [
    'headshot', 
    'name', 
    'email',
    'company',
    'twitter',
    'topics',
    'tracks',
    'participation_capacity',
    'engagement_ideas',
    'recommendation',
    'ques'
  ])

  console.log ("---\n",data)
  let _topics = [], _tracks = [], _participation_capacity = []
  let multiSelects = [data.topics,data.tracks,data.participation_capacity]
  let multiSelectsNotion = [_topics,_tracks,_participation_capacity]

  for (let i = 0; i < multiSelects.length; i++) {
    for (s of multiSelects[i]) {
      console.log ("pushing", s)
      multiSelectsNotion[i].push({
        "name": s.substring(0,100)
      })
    }
  }
  console.log(multiSelectsNotion)

  let response
  try {
    response = await notion.pages.create({
      parent: {
        database_id: helpers.MentorsDBNotion
      },
      properties: {
        // 'Headshot URL': {
        //   "url": data.headshot[0] ? data.headshot[0] : ""
        // },
        'Name': {
          "title": [
            {
              "type": "text",
              "text": {
                "content": data.name
              }
            }
          ]
        },
        'Email': {
          "email": data.email? data.email : ""
        },
        'Company / Professional Affiliation': {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": data.company? data.company : ""
              }
            }
          ]
        },
        'Twitter': {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": data.company ? data.company : ""
              }
            }
          ]
        },
        'Topics': {
          "multi_select": _topics
        },
        'Tracks': {
          "multi_select": _tracks
        },
        'Participation Capacity': {
          "multi_select": _participation_capacity
        },
        'Engagement Ideas': {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": data.engagement_ideas ? data.engagement_ideas : ""
              }
            }
          ]
        },
        'Recommendation': {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": data.recommendation? data.recommendation:""
              }
            }
          ]
        },
        'What is one idea you haven\'t been able to stop thinking about recently? Can be Web 3 or in general.': {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content":data.ques
              }
            }
          ]
        }
  
      }
    })
  } catch (err) {
    console.log (err)
  }

  console.log(response)
  res.status(200).send({})
})


module.exports = routes
