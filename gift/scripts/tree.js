const { MerkleTree } = require('../gift/helpers/merkle')
const { hashes } = require('../gift/data/users.json')

async function merkle (hashes) {
  let hashesBuffer = []
  for (hash of hashes) {
    hashesBuffer.push(Buffer.from(hash,"hex"))
  }
  const tree = MerkleTree(hashesBuffer)
  return tree
}

const tree = merkle (hashes)
module.exports = { tree }
