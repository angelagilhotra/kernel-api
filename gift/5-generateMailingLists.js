const fs = require('fs');
const neatCsv = require('neat-csv');
const {emailToUserDetails} = require('./data/users.json');
const blocks = [
  {"block": "5", "file": "block_5_award_notes.csv"}
]

// for block in blocks
// fetch full name, hash from emailToUserDetails in users
// create mailing.json ->
/**
 *  {
 *    "block": "4",
 *    "mailing": [
 *      {
 *        "email": ...,
 *        "hash": ...,
 *        "full name": ...,
 *        "first name": ...
 *      }
 *     ]
 *  }
 */

 async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json))
  } catch (err) {
    console.error(err)
  }
}

(async() => {
  let r = [];
  for (b of blocks) {
    let d = await fs.readFileSync(__dirname + '/data/' + b.file);
    let p = await neatCsv(d);
    p.map((o) => {
      const {first_name, name, hash} = emailToUserDetails[o['email'].toLowerCase()]
      r.push({
        first_name,
        name,
        hash,
        email: o['email'],
        block: b.block
      })
    })
  }
  await store(r, __dirname + '/data/mailing.json')
})();