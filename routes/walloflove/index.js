const routes = require('express').Router();
const { body, validationResult, param } = require('express-validator')
const twitterLookupEndpoint = "https://api.twitter.com/2/tweets/"
const { WebClient } = require('@slack/web-api')
const slackBotToken = process.env.SLACK_BOT_TOKEN
const slackClient = new WebClient(slackBotToken)
const supportedFormats = ["twitter", "slack"]
const needle = require('needle')
const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN

routes.get('/', (req, res) => {
  res.status(200).json({ message: 'Connected to wall of love!' });
});

routes.post("/new",
  body('data').isArray(),
  async (req, res) => {
    console.log (req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let allDataToStore = []
    for (obj of req.body["data"]) {
      let toStore = {}
      const { link, override_text, override_image } = {...obj}
      for (source of supportedFormats) {
        if (link.includes(source)) toStore["source"] = source
      }
      toStore["url"] = link
      if (toStore["source"] == supportedFormats[0]) {
        let tweetId = fetchTweetIdFromUrl (link)
        toStore["tweet"] = await fetchFromTwitter(tweetId, override_text, override_image)
      } 
      if (toStore["source"] == supportedFormats[1]) {
        let { conversationId, messageId } = fetchSlackConversationAndMessageId (link)
        let data = await fetchSlackMessage(conversationId, messageId, override_text, override_image)
        toStore["slack"] = {...data}
      }
      allDataToStore.push(toStore)
    }
    console.log (allDataToStore)
    res.send(allDataToStore)
  })
async function fetchSlackMessage(conversationId, messageId, o_text, o_image) {
  let r = await slackClient.conversations.history({
    channel: conversationId, 
    inclusive: true,
    limit: 1, 
    latest: messageId,
    oldest: messageId
  })
  let _text = r["messages"][0]["text"]
  let text = await replaceMentionedUsers (_text)
  let _author = await slackClient.users.info({
    "user": r["messages"][0]["user"]
  })
  let author = _author["user"]["real_name"]
  let image = _author["user"]["profile"]["image_72"]

  if (o_text) {
    text = o_text
  }
  if (o_image) {
    image = o_image
  }

  if (r.ok) {
    return {image, author, text}
  } else return "error" 
}
async function replaceMentionedUsers(text) {
  let t = text
  const matches = text.matchAll('\<([^>]*)\>');
  const mentionedUsers = [];
  for (const match of matches) {
    if (match[1].substring(1)[0] == 'U') {
      mentionedUsers.push(match[1].substring(1));
    }
  }
  for (user of mentionedUsers) {
    let name = (await slackClient.users.info({ user }))["user"]["real_name"]
    t = t.replace("<@" + user + ">", name)
  }
  return t
}
function fetchSlackConversationAndMessageId (url) {
  let r = url.split("/")
  let c = r.findIndex(el => el == "archives")
  let messageId = (r[c+2].replace("p", "") * 0.000001).toFixed(6)
  return { conversationId: r[c+1], messageId }
}
function fetchTweetIdFromUrl(url) {
  let r = url.split("/")
  let c = r.findIndex(el => el == "status")
  return r[c+1]
}
async function fetchFromTwitter(id, text, image) {
  const params = {
    "expansions": "author_id",
    "user.fields": "profile_image_url"
  }
  const r = await needle('get', twitterLookupEndpoint + id, params, {
    headers: {
        "User-Agent": "v2TweetLookupJS",
        "authorization": `Bearer ${twitterBearerToken}`
    }
  })
  return {
    image: image? image : r["body"]["includes"]["users"][0]["profile_image_url"],
    author: r["body"]["includes"]["users"][0]["username"],
    text: text? text: r["body"]["data"]["text"]
  }
} 

module.exports = routes;
