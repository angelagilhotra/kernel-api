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
1. cd gift/contracts
2. `npx hardhat compile`
3. add network config to `hardhat.config.js`
4. `npx hardhat run --network <network> scripts/sample-script.js`
5. copy contract address and paste in `gift/scripts/contract.js`
6. cd to root of directory
7. to flatten `npx hardhat flatten > flattened.sol`
7. `node gift/sripts/updateContract`
2. update `gift/scripts/contract.js` to add new network & set active to the required network