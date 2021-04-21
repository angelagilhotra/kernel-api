/**
* Fetch all messages from #gratitude
* store & categorize it according to the tagged/mentioned user
* json: {"userid":[array of messages tagged in]}
* another json: {"userid": "user's name"}
*/

const { WebClient } = require('@slack/web-api')
const crypto = require('crypto')
const fs = require('fs')
const token = process.env.SLACK_BOT_TOKEN
const web = new WebClient(token)
const { MerkleTree } = require('./helpers/merkle')

const PATH = {
  'users': __dirname + '/data/users.json',
  'data': __dirname + '/data/messages.json'
}


async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json))
  } catch (err) {
    console.error(err)
  }
}

let tokenIds= []
// fetch all users, generate hashes and token ids
async function users() {
  let r, cursor = '', users = []
  do {
    try {
      r = await web.users.list({
        limit: 100, cursor
      })
    } catch (e) { console.log(e) }
    let onlyHumans = r.members.filter((member) => {
      return member.is_bot != true && member.profile.real_name_normalized != 'Slackbot'
    })
    let reqDetails = onlyHumans.map((human) => {
      let _s=0, incr=14,hash, tokenId;
      hash = crypto.createHash("sha256").update(human.id).digest("hex")
      tokenId = parseInt(hash.slice(_s,_s+incr),16)
      while (tokenIds.includes(tokenId)) {
        console.log('found duplicate')
        _s++;
        tokenId = parseInt(hash.slice(_s, _s+incr), 16)
      }
      tokenIds.push(tokenId)
      return {
        user_id: human.id,
        name: human.profile.real_name_normalized,
        hash,
        tokenId
      }
    })
    users.push(...reqDetails)
    cursor = r.response_metadata.next_cursor
  } while (r.response_metadata.next_cursor)
  return users
}

async function gift() {
  console.log ('fetching all users')
  let _users = await users()
  let allUsers = {
    "users": _users, 
    "userIdToNames": {},
    "hashToUserDetails": {},
    "hashes": [],
  }
  _users.forEach((u) => {
    allUsers["userIdToNames"][u.user_id] = u.name;
    allUsers["hashToUserDetails"][u.hash] = {
      name: u.name, token: u.tokenId, userId: u.user_id
    }
    allUsers["hashes"].push(u.hash)
  })
  console.log ('storing');
  await store(allUsers, PATH.users);
  console.log('stored at', PATH.users);
}

gift()
