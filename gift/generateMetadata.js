const { users } = require('./data/users.json')
const messages = require('./data/messages.json')
const awards = require('./data/awards.json')
const fs = require('fs')
const self = "http://api.kernel.community"
const frontend = "https://gratitude.kernel.community/c"
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
    let gratitude = {}, award = "", testimonial = ""
    if (messages[u.user_id]) {
      gratitude = {
        received: messages[u.user_id],
        count: messages[u.user_id].length
      }
      if (awards[u.user_id]) {
        award = awards[u.user_id].award
        testimonial = awards[u.user_id].notes
      }
    }
    metadata[u.tokenId] = {
      tokenId: u.tokenId,
      image: self + '/' + u.tokenId + '.png',
      external_url: frontend + '/' + u.hash,
      name: u.name,
      attributes: {
        award,
        testimonial,
        gratitude,
      }
    }
  }
  store(metadata, __dirname + '/data/metadata.json')
}

generateMetadata()
