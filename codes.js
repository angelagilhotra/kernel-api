// setup db with codes 
const level = require('level')
const { users } = require('./gift/users.json')
const HashesStatusDB = level('db/HashesStatus')

for (user of users) {
  HashesStatusDB.put(user.hash, false, function(err) {
    if (err) return console.log('error:', err) // I/O errror
  })
}

module.exports = {
  hashStatus: HashesStatusDB,
}
