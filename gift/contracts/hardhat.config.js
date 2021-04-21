require("@nomiclabs/hardhat-waffle");
const _pk = process.env.ADMIN_PK;
const key = process.env.INFURA_KEY;
const infura_goerli_url = "https://goerli.infura.io/v3/" + key

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
      url: infura_goerli_url,
      accounts: [_pk]
    },
    // xdai: {
    //   url: "https://xdai.poanetwork.dev",
    //   accounts: [_pk]
    // }
  },
  solidity: "0.8.3",
};

