const { expect } = require("chai");

describe("KERNELGift", function() {
  it("Should return the new root once it's changed", async function() {
    const Gift = await ethers.getContractFactory("KERNELGift");
    const gift = await Gift.deploy("Testing KERNEL Gift", "KGFT");
    
    await gift.deployed();
    expect(await gift.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});