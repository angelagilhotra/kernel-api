// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);
  const Gift = await hre.ethers.getContractFactory("KERNELGift");
  const gift = await Gift.deploy("KERNEL Gift", "KGFT");

  await gift.deployed();
  console.log("Gift deployed to:", gift.address);

  // fetch from API ideally.
  let root = await gift.functions.setMerkleRoot("0x7fbb8bec64fd8a97945fc402ca39f84bbf88d369d9facd6bd4c86c60e070814f")
  console.log ('root set', root)
  // api endpoint for token metadata
  let uri = await gift.functions.setTokenUri("https://testing-gift-api.herokuapp.com/raw")
  console.log ('uri set', uri);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
