# KERNEL Gift
## To update metadata, tokens, users
1. `source .env`
2. `node gift/getUsers && node gift/gift.js && node gift/parseAwards.js && node gift/generateMetadata.js`
3. `node scripts/updateContract.js` (needs to be run each time set of users changes) 
4. `node server.js`

## To update contract
1. `source .env`
2. `node scripts/updateContract.js`

## To deploy contract on new network and update metadata, tokens, users
1. `source .env`
2. `cd gift/contracts`
3. `npx hardhat compile`
4. add network config to `hardhat.config.js`
5. `npx hardhat run --network <network> scripts/deploy.js`
6. copy contract address and paste in `gift/scripts/contract.js`
7. to flatten `npx hardhat flatten > flattened.sol`
8. cd to root of directory
9. `node gift/sripts/updateContract`
10. update `gift/scripts/contract.js` to add new network & set active to the required network