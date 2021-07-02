/* eslint-disable no-restricted-syntax */
/**
* Fetch all messages from #gratitude
* store & categorize it according to the tagged/mentioned user
* json: {"userid":[array of messages tagged in]}
* another json: {"userid": "user's name"}
*/

const { WebClient } = require('@slack/web-api');
const fs = require('fs');

const token = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(token);

const CHANNEL = {
  name: 'kernel-gratitude',
  id: 'C0178GGS4TB',
};
const PATH = {
  users: `${__dirname}/data/users.json`,
  data: `${__dirname}/data/messages.json`,
};
const allUsers = require('./data/users.json');

function getRequiredDetails(msg) {
  const n = msg.text;
  // eslint-disable-next-line no-useless-escape
  const matches = n.matchAll('\<([^>]*)\>');
  const mentionedUsers = [];
  for (const match of matches) {
    if (match[1].substring(1)[0] == 'U') {
      mentionedUsers.push(match[1].substring(1));
    }
  }
  let totalReactions = 0;
  if (msg.reactions) {
    for (let i = 0; i < msg.reactions.length; i++) {
      totalReactions += msg.reactions[i].count;
    }
  }
  return {
    id: msg.ts, // timestamp - priv key
    text: msg.text, // message text
    user: msg.user, // sent by
    timestamp: new Date(Math.ceil(msg.ts)).toUTCString(),
    mentionedUsers, // elements of the message (see: https://api.slack.com/reference/block-kit/blocks)
    reactions: msg.reactions ? JSON.stringify(msg.reactions) : '', // all reactions
    total_reactions: totalReactions,
    in_reply_to: msg.thread_ts,
    // permalink: msgLink.permalink
  };
}

async function getAllReplies(channel, ts) {
  let r;
  const result = [];
  do {
    try {
      r = await web.conversations.replies({
        channel, ts,
      });
    } catch (e) { throw e; }
    result.push(...r.messages);
  } while (r.response_metadata.next_cursor);
  result.shift();
  return result;
}

// get all messages from a channel
async function getMessagesFromChannel(channel) {
  let r; let
    cursor = '';
  const allMessages = [];
  do {
    try {
      r = await web.conversations.history({
        channel, cursor,
      });
    } catch (e) { console.log('error:', e); }
    const userMessages = r.messages.filter((message) => !(message.bot_id));
    for (msg of userMessages) {
      const details = await getRequiredDetails(msg);
      allMessages.push(details);
      if (msg.thread_ts) {
        const responses = await getAllReplies(channel, msg.ts);
        for (response in responses) {
          const details = await getRequiredDetails(responses[response]);
          allMessages.push(details);
        }
      }
    }
    cursor = r.response_metadata.next_cursor;
  } while (r.response_metadata.next_cursor);
  return allMessages;
}

async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json));
  } catch (err) {
    console.error(err);
  }
}

async function gift() {
  console.log('fetching all messages from ', CHANNEL.name);
  const messages = await getMessagesFromChannel(CHANNEL.id);
  const categorized = {};
  console.log('categorizing messages');
  messages.forEach((m) => {
    for (user of m.mentionedUsers) {
      if (!categorized[user]) {
        categorized[user] = [];
      }
      let _m = m.text;
      const matches_usernames = _m.matchAll('\<([^>]*)\>');
      for (const match of matches_usernames) {
        const id = match[1].substring(1);
        if (allUsers.userIdToNames[id]) {
          const name = allUsers.userIdToNames[id];
          _m = _m.replace(match[0], `@${name}`);
        }
      }
      if (user == m.user) continue;
      categorized[user].push({
        message: _m,
        by: allUsers.userIdToNames[m.user],
      });
    }
  });

  console.log('storing');
  await store(categorized, PATH.data);
  console.log('stored at', PATH.data);
}

gift();
