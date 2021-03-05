const {
  users, 
  userIdToNames, 
  hashToUserDetails, 
  hashes
} = require('./data/users.json')
const messages = require('./data/messages.json')
const fs = require('fs')
const imgURL='https://testing-gift-api.herokuapp.com/i'
const minLines = 20
const minNoise = 80


let metadata = {}

async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json))
  } catch (err) {
    console.error(err)
  }
}

async function generateMetadata () {
  for (u of users) {
    let gratitude
    // let noise = minNoise
    // let lines = minLines

    if (messages[u.user_id]) {
      gratitude = {
        received: messages[u.user_id],
        count: messages[u.user_id].length
      }
      // @todo check and redo this
      // noise += (messages[u.user_id].length % 50) * 5
    } else {
      gratitude = {}
    }
    metadata[u.tokenId] = {
      name: u.name,
      award: {},
      gratitude,
      quote: "...",
      image: imgURL + '/' + encodeURI(u.name),
      tokenId: u.tokenId
    }
  }
  store(metadata, __dirname + '/data/metadata.json')
}

generateMetadata()
