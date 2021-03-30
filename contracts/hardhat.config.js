require("@nomiclabs/hardhat-waffle");
const _pk = process.env.PRIVATE_KEY;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
    },
    goerli: {
      url: "https://goerli.infura.io/v3/f3ffe28620114fd2bd00c5a3ebe55558",
      accounts: [_pk]
    },
    xdai: {
      url: "https://xdai.poanetwork.dev",
      accounts: [_pk]
    }
  },
  solidity: "0.8.0",
};

