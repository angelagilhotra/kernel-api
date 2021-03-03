// import libraries
const express = require('express')
  , bodyParser = require('body-parser')
const crypto = require('crypto')
const fetch = require("node-fetch");

// for slack
const spreadsheetId = '1ZeyYQ-M46cSELK0Nw7TERH5jdjfnkwqhRfhprMknENI'
const baseUrl = "https://pushtogsheet.herokuapp.com";
const query = `valueInputOption=RAW&pizzly_pkey=pope8Qy8qfYyppnHRMgLMpQ8MuEUKDGeyhfGCj`;
const url = new URL(`/proxy/google-sheets/${spreadsheetId}/values/A1:append?${query}`, baseUrl);

// import data
const { hashStatus } = require('./codes')
const { 
  users, 
  userIdToNames, 
  hashToUserDetails, 
  hashes } = require('./gift/users.json')
const { tree } = require('./tree')
const metadata = require('./gift/metadata.json')

// initialise app
const app = express()

app.use(bodyParser.json())

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
// update hash status
app.post('/update', async (req,res) => {
  const { hash, status } = req.body
  let r
  try {
    r = await hashStatus.put(hash, status);
  } catch (e) {
    console.log('key error', e)
    res.send ({
      ok: false, error: e
    })
  }
  res.send ({})
})

app.post('/slack', async(req,res) => {
  const { payload } = req.body
  console.log ('received payload',payload)
  let data = [
    [payload.user.name, payload.user.username, payload.actions[0].selected_option.value, JSON.stringify(payload)],
  ]
  fetch(url.href, {
    method: "POST",
    body: JSON.stringify({ values: data }),
    headers: { 'Pizzly-Auth-Id': 'ecc6d9c0-7c43-11eb-bce1-e9a8c89e2868' }
  })
  .then((res) => res.text())
  .then(console.log)
  .catch(console.error);
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
