// import libraries
const express = require('express')
  , bodyParser = require('body-parser')
  , cors = require('cors')
const crypto = require('crypto')
const axios = require('axios').default
const { googleKeys, airtable } = require('./credentials.json')


// for slack
const Airtable = require("airtable");
const base = new Airtable({apiKey: airtable.apiKey}).base(airtable.base);

// for bubble
const {google} = require('googleapis')

// import data
const { hashStatus } = require('./scripts/codes')
const { 
  users, 
  userIdToNames, 
  hashToUserDetails, 
  hashes } = require('./gift/data/users.json')
const { tree } = require('./scripts/tree')
const metadata = require('./gift/data/metadata.json')

// initialise app
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

// set port
const port = process.env.PORT || 3000

// returns token metadata
app.get('/raw/:tokenId', async(req, res) => {
  const { tokenId } = req.params
  const data = metadata[tokenId]
  res.send({
    ...data
  })
})
app.get('/tokens', async(req,res) => {
  let root = (await tree).getRoot()
  root = root.toString("hex")
  let count = Object.keys(metadata).length;
  res.send({
    ok: true,
    root,
    tokens: metadata,
    count
  })
})
// returns user's all details & token metadata
app.get('/hash/:hash', async (req, res, next) => {
  const { hash } = req.params
  try {
    s = await hashStatus.get(hash)
  } catch (e) {
    console.log('key error', e)
    res.send ({
      ok: false, error: e
    })
  }

  d = await hashToUserDetails[hash]
  _p = (await tree).getProof(Buffer.from(hash, "hex"))
  let proof = []
  for (p of _p) {
    proof.push('0x'+ p.toString("hex"))
  }
  
  res.send ({
    ok: true, data: {
      claim_status: s, 
      details: d, 
      tokenId: d["token"], 
      metadata: metadata[d["token"]],
      proof
    }
  })
})
// get user details from user hash
app.get('/user/:userId', async(req,res) => {
  const { userId } = req.params
  let n = userIdToNames[userId]
  let h = crypto.createHash("sha256").update(userId).digest("hex")
  res.send({
    ok: true,
    data: {
      hash: h, name: n
    }
  })
})
// get claim status from hash
app.get('/:hash/claim', async (req,res) => {
  const { hash } = req.params
  let status
  try {
    status = await hashStatus.get(hash)
  } catch (e) {
    console.log('key error', e)
    res.send ({
      ok: false, error: e
    })
  }
  if (!status) {
    console.log ('claim status=',status)
  }
  res.send({
    ok: true,
    data: {
      claim_status: status
    }
  })
})

// for slack app -- getting basic NPS
app.post('/slack', async(req,res) => {
  const payload = JSON.parse(req.body.payload)
  const { user, actions } = payload
  console.log ({
    user, actions
  })
  base('NPS').create([
    {
      "fields": {
        "userid": user.id,
        "user": user.name,
        "reaction": actions[0].selected_option.value,
        "timestamp": actions[0].action_ts
      }
    }
  ], function(err, records) {
    if (err) {
      console.error(err);
      res.send({'error': err});
      return;
    }
    records.forEach(function (record) {
      console.log(record.getId());
    });
  });
  res.send({'ok':true})
})

/**
 * test api for bubble
 */
app.post('/bubble', async(req,res) => {
  // let t = req.body
  console.log('from bubble', req.body);
  res.send({'ok':true})
})

app.post('/createEvent', async(req,res) => {
  console.log('will now create a new event');
  console.log('from bubble', req.body);
  const { 
    title, 
    description, 
    location,
    timezone,
    date_time,
    organizer_email,
    organizer,
    slug
  } = req.body
  var data = new FormData();
  const parsed_date_time = new Date(date_time + ' GMT');
  const _description = description + '\n\norganizer:' + organizer + '\n\nevent page: https://kb3-juntos.bubbleapps.io/version-test/event_page/'+slug+'\n\n'
  data.append('token', 'api1596136832JQFeMLgszSiaZ9NdO0T592473');
  data.append('calendar_id','1616487337329865');
  data.append('title',title);
  data.append('description', _description);
  data.append('location', location);
  data.append('organizer', organizer);
  data.append('organizer_email', organizer_email);
  data.append('reminder', '20');
  data.append('start_date', parsed_date_time);
  data.append('end_date', parsed_date_time + 60*60000);

  // call calendarX api to create a new event
  const r = await axios.post('https://www.calendarx.com/api/v1/calendars/events/create/', data)
  console.log (r)
  
  res.send({'ok': true})
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
