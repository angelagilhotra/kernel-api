/**
 * update Root on contract
 */

const ethers = require('ethers'); 
const contract = require('./contract')
const network = contract["active"]
const address = contract[network]["address"]
const rpc = contract[network]["rpc"]
const abi = contract["abi"]
const { tree } = require('./tree')

const pk = process.env.ADMIN_PK
const customHttpProvider = new ethers.providers.JsonRpcProvider(rpc);

const wallet = new ethers.Wallet(pk,customHttpProvider);
const GiftContract = new ethers.Contract(address,abi,wallet);

const uri = "https://api.kernel.community/gift/raw/"

async function main() {
  console.log ('---updating contract---')
  console.log ('updating merkle root')
  let root = (await tree).getRoot()
  root = root.toString("hex")
  let _root = "0x" + root
  // update merkle root on contract
  let r = await GiftContract.setMerkleRoot(_root)
  console.log (r)
  console.log ('updating token uri')
  // update token uri link
  let t = await GiftContract.setTokenUri(uri)
  console.log (r)
  console.log ('done✨')
}

main ()
