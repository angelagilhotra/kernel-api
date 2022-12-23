/* eslint-disable no-console */
/**
 * update Root on contract
 */

const ethers = require('ethers');
const contract = require('./contract');

const network = contract.active;
const { address } = contract[network];
const { rpc } = contract[network];
const { abi } = contract;
const { tree } = require('./tree');

const pk = process.env.ADMIN_PK;
const customHttpProvider = new ethers.providers.JsonRpcProvider(rpc);

const wallet = new ethers.Wallet(pk, customHttpProvider);
const GiftContract = new ethers.Contract(address, abi, wallet);

const uri = 'https://api.kernel.community/gift/raw/';

async function main() {
  console.log('---updating contract on', contract.active, '---');
  console.log('updating merkle root');
  let root = (await tree).getRoot();
  root = root.toString('hex');
  const _root = `0x${root}`;
  console.log('setting root:', _root);
  // update merkle root on contract
  const r = await GiftContract.setMerkleRoot(_root);
  console.log(r);
  // console.log ('updating token uri')
  // update token uri link
  // let t = await GiftContract.setTokenUri(uri)
  // console.log (t)
  console.log('done✨');
}

main();
