const fs = require('fs')
const neatCsv = require('neat-csv');

async function store(json, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(json))
  } catch(err) {
    console.error(err)
  }
}

async function main () {
  let data = await fs.readFileSync(__dirname + '/data/award_notes.csv')
  let parsed = await neatCsv(data)
  
  let res = {}
  requiredJson = parsed.map((obj) => {
    if (!res[obj.user_id]) res[obj.user_id] = {}
    res[obj.user_id] = {
      notes: obj.notes,
      award: obj.award
    }
  })
  
  store(res, __dirname + '/data/awards.json')
  
}

main ()