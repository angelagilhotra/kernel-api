const fs = require('fs')
const neatCsv = require('neat-csv');
const files = ['block_1_2_award_notes.csv', 'block_3_award_notes.csv', 'block_4_award_notes.csv', 'block_5_award_notes.csv']

async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json))
  } catch(err) {
    console.error(err)
  }
}

async function main () {
  let res = {}
  for (fileName of files) {
    let data = await fs.readFileSync(__dirname + '/data/' + fileName)
    let parsed = await neatCsv(data)

    parsed.map((obj) => {
      if (!res[obj.user_id]) res[obj.user_id] = {}
      res[obj.user_id] = {notes: obj.notes, award: obj.award}
    })

  }
  store(res, __dirname + '/data/awards.json')
}

main ()