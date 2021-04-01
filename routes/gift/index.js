const routes = require('express').Router();
const crypto = require('crypto')
const { tree } = require('../../gift/scripts/tree')
const { 
  users, 
  userIdToNames, 
  hashToUserDetails, 
  hashes } = require('../../gift/data/users.json')
const metadata = require('../../gift/data/metadata.json')

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected to gift!' });
});

// get user details from user hash
routes.get('/user/:userId', async(req,res) => {
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

// returns user's all details & token metadata
routes.get('/hash/:hash', async (req, res, next) => {
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

routes.get('/tokens', async(req,res) => {
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

// returns token metadata
routes.get('/raw/:tokenId', async(req, res) => {
  const { tokenId } = req.params
  const data = metadata[tokenId]
  res.send({
    ...data
  })
})

module.exports = routes;