/**
 * change ever occurrence of slack user id in a message with their name
 */
const { userIdToNames } = require('./gift/data/users.json')

function replaceIdWithNames (msg) {
  let n = msg;
  const matches = msg.matchAll('\<([^>]*)\>')
  console.log([...matches])
  for (const match of matches) {
    let id = match[1].substring(1)
    let name = userIdToNames[id]
    n = n.replace(match[0], name)
  }
  return n
}
function main () {
  let msg = "I want to give a shout out to <@U016QNB6M3M> who has been a GREAT person to collaborate with. I am enjoying meeting and working with so many wonderful femme tech folks. For <@U016G7SR31V> for your sagely wisdom and kind collaboration.\n\nI also want to give a shout out to <@U016HBVGSP8> and <@U016Q825Y3U> for your insights. As well as <@U016PEM9U5B> for your infectious enthusiasm, including our project in your baby, and your desire to do great things while you geek out.\n\nMany more shout outs to come!"

  let replaced = replaceIdWithNames(msg)
  console.log (replaced)
}

main ()
