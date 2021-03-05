// setup db with codes 
const level = require('level')
const { users } = require('../gift/data/users.json')
const HashesStatusDB = level('db')

for (user of users) {
  HashesStatusDB.put(user.hash, false, function(err) {
    if (err) return console.log('error:', err) // I/O errror
  })
}

module.exports = {
  hashStatus: HashesStatusDB,
}
