// import libraries
const express = require('express')
  , bodyParser = require('body-parser')
const crypto = require('crypto')

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
const port = process.env.PORT || 3000


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

app.get('/raw/:tokenId', async(req, res) => {
  const { tokenId } = req.params
  const data = metadata[tokenId]
  res.send({
    ...data
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

app.post('/claim', async (req,res) => {
  const { hash, tokenId } = req.body
  let status, minted  
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

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})
