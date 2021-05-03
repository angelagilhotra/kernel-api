require("@nomiclabs/hardhat-waffle");
const _pk = process.env.ADMIN_PK;
const key = process.env.INFURA_KEY;
const infura = "https://<network>.infura.io/v3/"+key

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  networks: {
    hardhat: {
    },
    goerli: {
      url: infura.replace("<network>", "goerli"),
      accounts: [_pk]
    },
    rinkeby: {
      url: infura.replace("<network>", "rinkeby"),
      accounts: [_pk]
    },
    mainnet: {
      url: infura.replace("<network>", "mainnet"),
      accounts: [_pk]
    }
  },
  solidity: "0.8.3",
};

