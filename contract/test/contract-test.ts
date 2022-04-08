import { ethers, waffle } from "hardhat";
import { Signer } from "ethers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
const { expect, assert } = require("chai");
const BigNumber = require('ethers').BigNumber;
const provider = waffle.provider;

const test_config = {
  price: 1,
  contract_name: "AstarCats",
  max_supply: 7777,
  max_mint: 10,
  symbol: "CAT"
};

describe("AstarCats contract", function () {
  let owner: SignerWithAddress;
  let bob: SignerWithAddress;
  let alis: SignerWithAddress;
  let ad: any;
  let addrs;

  const not_revealed_uri = "not_revealed_uri";

  beforeEach(async function () {
    // @ts-ignore
    [owner, bob, alis, ...addrs] = await ethers.getSigners();
    const AstarCats = await ethers.getContractFactory(test_config.contract_name);
    ad = await AstarCats.deploy(test_config.contract_name, test_config.symbol, not_revealed_uri);
    await ad.deployed();

    // Ensure contract is paused/disabled on deployment
    expect(await ad.is_paused()).to.equal(true);
    expect(await ad.is_revealed()).to.equal(false);
    await ad.pause(false);
  });

  describe("Basic checks", function () {

    it('check the owner', async function () {
      expect(await ad.owner()).to.equal(owner.address)
    });

    it('check the maxSupply', async function () {
      expect(await ad.maxSupply()).to.equal(test_config.max_supply);
    });

    it('check default is PreSale', async function () {
      expect(await ad.is_presale()).to.equal(true);
    });

    it("Confirm Cat price", async function () {
      const cost = ethers.utils.parseUnits(test_config.price.toString(), 0)
      const expectedCost = cost.mul(ethers.constants.WeiPerEther);
      expect(await ad.cost()).to.equal(expectedCost);
    });

  });

  describe("OwnerFunction checks", function () {
    it("Owner can ownermint", async () => {
      await expect(ad.connect(owner).ownerMint(1)).to.be.ok;
    });

    it("Non-owner cant ownermint", async () => {
      await expect(ad.connect(bob).ownerMint(1)).to.reverted;
    });
  });

  describe("Public Minting checks", function () {
    beforeEach(async function () {
      await ad.presale(false);
    });

    it("Non-owner cannot mint without enough balance", async () => {
      const degenCost = await ad.cost();
      await expect(ad.connect(bob).mint(1, { value: degenCost.sub(1) })).to.be.reverted;
    });

    it("Owner and Bob mint", async () => {
      const degenCost = await ad.cost();
      let tokenId = await ad.totalSupply();
      expect(await ad.totalSupply()).to.equal(0);
      expect(
        await ad.mint(1, {
          value: degenCost,
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, tokenId + 1);

      expect(await ad.totalSupply()).to.equal(1);
      tokenId = await ad.totalSupply();
      expect(
        await ad.connect(bob).mint(1, {
          value: degenCost,
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add('1'));

      expect(await ad.totalSupply()).to.equal(2);
    });

    it("Minting tokens increased contract balance", async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      // Mint first token and expect a balance increase
      const init_contract_balance = await provider.getBalance(ad.address);
      expect(await ad.mint(1, { value: degenCost })).to.be.ok;
      expect(await provider.getBalance(ad.address)).to.equal(degenCost);

      // Mint two additonal tokens and expect increase again
      expect(await ad.mint(2, { value: degenCost.mul(2) })).to.be.ok;
      expect(await provider.getBalance(ad.address)).to.equal(degenCost.mul(3));
    });

    it("Bob mints " + test_config.max_mint, async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      expect(
        await ad.connect(bob).mint(test_config.max_mint, {
          value: degenCost.mul(test_config.max_mint),
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add(test_config.max_mint.toString()));
      expect(await ad.totalSupply()).to.equal(test_config.max_mint);

    });

    it("Bob mints 1 plus " + (test_config.max_mint - 1), async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      expect(
        await ad.connect(bob).mint(1, {
          value: degenCost.mul(1),
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add('1'));
      expect(await ad.totalSupply()).to.equal(1);

      expect(
        await ad.connect(bob).mint(test_config.max_mint - 1, {
          value: degenCost.mul(test_config.max_mint - 1),
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add((test_config.max_mint - 1).toString()));
      expect(await ad.totalSupply()).to.equal(test_config.max_mint);

    });

    it("Bob fails to mints " + (test_config.max_mint + 1), async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      await expect(ad.connect(bob).mint((test_config.max_mint + 1), { value: degenCost.mul((test_config.max_mint + 1)), }))
        .to.revertedWith("maxMintAmount over");
    });

    it(`Bob fails to mints ${test_config.max_mint} plus 1`, async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      expect(
        await ad.connect(bob).mint(test_config.max_mint, {
          value: degenCost.mul(test_config.max_mint),
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add(test_config.max_mint.toString()));
      expect(await ad.totalSupply()).to.equal(test_config.max_mint);

      // should fail to mint additional one in new mint call
      await expect(ad.connect(bob).mint(1, { value: degenCost }))
        .to.be.revertedWith("maxMintAmount over");

      expect(await ad.totalSupply()).to.equal(test_config.max_mint);
    });

    it(`Bob fails to mints 1 plus ${test_config.max_mint}`, async () => {
      const degenCost = await ad.cost();
      const tokenId = await ad.totalSupply();

      expect(
        await ad.connect(bob).mint(1, {
          value: degenCost.mul(1),
        })
      )
        .to.emit(ad, "Transfer")
        .withArgs(ethers.constants.AddressZero, bob.address, tokenId.add('1'));
      expect(await ad.totalSupply()).to.equal(1);

      // should fail to mint additional five in new mint call
      await expect(ad.connect(bob).mint(test_config.max_mint, { value: degenCost.mul(test_config.max_mint) }))
        .to.revertedWith("maxMintAmount over");

      expect(await ad.totalSupply()).to.equal(1);
    });

    it("Bob fails to mints 2 with funds for 1", async () => {
      const degenCost = await ad.cost();

      await expect(ad.connect(bob).mint(2, { value: degenCost }))
        .to.revertedWith("Not enough funds for mint");

      expect(await ad.totalSupply()).to.equal(0);
    });

  });

  describe("URI checks", function () {
    beforeEach(async function () {
      await ad.presale(false);
    });

    it("Token URI not available for non-minted token", async function () {
      await expect(ad.tokenURI(1)).to.be.reverted;
    });

    it("URI not visible before reveal", async function () {
      const degenCost = await ad.cost();
      expect(await ad.mint(1, { value: degenCost })).to.be.ok;
      expect(await ad.tokenURI(1)).to.equal(not_revealed_uri);
    });

    it("URI visible after reveal", async function () {
      expect(ad.reveal()).to.be.ok;

      const degenCost = await ad.cost();
      expect(await ad.mint(5, { value: degenCost.mul(5) })).to.be.ok;

      const baseUri = "baseUri/";
      const baseExtension = ".ext";

      expect(await ad.setBaseURI(baseUri)).to.be.ok;
      expect(await ad.setBaseExtension(baseExtension)).to.be.ok;

      const index = 3;
      expect(await ad.tokenURI(3)).to.equal(baseUri + index.toString() + baseExtension);
    });
  });

  describe("Whitelist checks", function () {
    it("Non Whitelisted user cant buy on PreSale", async function () {
      const degenCost = await ad.cost();
      await expect(ad.connect(bob).mint(1, { value: degenCost }))
        .to.be.revertedWith("Can not whitelist");
      await expect(ad.connect(owner).mint(1, { value: degenCost }))
        .to.be.revertedWith("Can not whitelist");
    });

    it("Whitelisted user can buy on PreSale", async function () {
      const degenCost = await ad.cost();
      let tokenId = await ad.totalSupply();

      expect(await ad.pushMultiWL([bob.address])).to.be.ok;
      expect(await ad.getWhiteListCount()).to.equal(1);
      await assertMintSuccess(ad, degenCost, bob, 1);

      await expect(ad.connect(bob).mint(1, { value: degenCost })).to.be.revertedWith("Can not whitelist");
    });

    it("Whitelisted user can buy 5", async function () {
      const degenCost = (await ad.cost()).mul(5);
      let tokenId = await ad.totalSupply();
      expect(await ad.pushMultiWL([bob.address, bob.address, bob.address, bob.address, bob.address])).to.be.ok;
      await assertMintSuccess(ad, degenCost, bob, 5);

      await expect(ad.connect(bob).mint(1, { value: degenCost })).to.be.revertedWith("Can not whitelist");
    });

    it("Whitelisted user can buy 3 + 2", async function () {
      let degenCost = (await ad.cost()).mul(3);
      expect(await ad.pushMultiWL([bob.address, bob.address, bob.address, bob.address, bob.address])).to.be.ok;
      await assertMintSuccess(ad, degenCost, bob, 3);
      await assertMintSuccess(ad, degenCost, bob, 2, 3);

      await expect(ad.connect(bob).mint(1, { value: degenCost })).to.be.revertedWith("Can not whitelist");
    });

    it("Non WhiteList user block after Whitelisted user buy", async function () {
      const degenCost = await ad.cost();

      expect(await ad.pushMultiWL([bob.address, bob.address])).to.be.ok;
      expect(await ad.getWhiteListCount()).to.equal(2);
      await assertMintSuccess(ad, degenCost, bob, 1);

      await expect(ad.connect(alis).mint(1, { value: degenCost })).to.be.revertedWith("Can not whitelist");

      await assertMintSuccess(ad, degenCost, bob, 1, 1);

      await expect(ad.connect(bob).mint(1, { value: degenCost })).to.be.revertedWith("Can not whitelist");
    });

  });

});

async function assertMintSuccess(ad: any, cost: number, signer: SignerWithAddress, num: number, alreadySupply = 0) {
  let tokenId = await ad.totalSupply();

  expect(
    await ad.connect(signer).mint(num, {
      value: cost,
    })
  )
    .to.emit(ad, "Transfer")
    .withArgs(ethers.constants.AddressZero, signer.address, tokenId.add(num.toString()));
  expect(await ad.totalSupply()).to.equal(num + alreadySupply);
}