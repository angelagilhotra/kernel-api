const artifacts = require("../contracts/artifacts/contracts/KERNELGift.sol/KERNELGift.json")
const abi = JSON.stringify(artifacts["abi"])
const infura_key = process.env.INFURA_KEY;
module.exports = {
  abi,
  xDAI: {
    address: "0x80Cb09703Dd24e91A8b5BF71d763cfaBC46B1c3d",
    rpc: "https://xdai.poanetwork.dev",
    chainId: 100,
    txHashLink:
      "https://blockscout.com/xdai/mainnet/tx/<transaction>/token-transfers",
    addressLink: "https://blockscout.com/poa/xdai/address/<address>/tokens"
  },
  goerli: {
    address: "0x370bf702275915D5bE43E410beb18d1ca6B54B20",
    rpc: "https://goerli.infura.io/v3/" + infura_key,
    chainId: 5,
    txHashLink: "https://goerli.etherscan.io/tx/<transaction>",
    addressLink: "https://goerli.etherscan.io/address/<address>"
  },
  active: "goerli"
};
