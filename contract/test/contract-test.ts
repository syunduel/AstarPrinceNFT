import { ethers, waffle } from "hardhat";
import { Signer } from "ethers";
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
  let owner: any;
  let bob: any;
  let charlie;
  let addrs;
  let ad: any;

  const not_revealed_uri = "not_revealed_uri";

  beforeEach(async function () {
    [owner, bob, charlie, ...addrs] = await ethers.getSigners();
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

    it("Confirm Cat price", async function () {
      const cost = ethers.utils.parseUnits(test_config.price.toString(), 0)
      const expectedCost = cost.mul(ethers.constants.WeiPerEther);
      expect(await ad.cost()).to.equal(expectedCost);
    });

  });

  describe("Minting checks", function () {

    it("Non-owner cannot mint without enough balance", async () => {
      const degenCost = await ad.cost();
      await expect(ad.connect(bob).mint(1, { value: degenCost.sub(1) })).to.be.reverted;
    });

    it("Owner cant mint without enough balance or for free", async () => {
      const degenCost = await ad.cost();
      expect(await ad.mint(1, { value: degenCost.sub(1) })).to.be.ok;
      expect(await ad.mint(1, { value: 0 })).to.be.ok;
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

  describe("Wallet checks", function () {

    it("Wallets for owner and Bob are as expected", async () => {
      expect(await ad.walletOfOwner(owner.address)).to.be.empty;

      const degenCost = await ad.cost();

      const ownerFirstCount = 2;
      const bobFirstCount = 1;
      const ownerSecondCount = 3;

      expect(await ad.mint(ownerFirstCount, { value: degenCost })).to.be.ok;
      const ownerFirstWallet = await ad.walletOfOwner(owner.address);
      expect(ownerFirstWallet).to.have.lengthOf(ownerFirstCount);
      expect(ownerFirstWallet[0]).to.equal(1);
      expect(ownerFirstWallet[1]).to.equal(2);

      expect(await ad.connect(bob).mint(bobFirstCount, { value: degenCost })).to.be.ok;
      const bobFirstWallet = await ad.walletOfOwner(bob.address);
      expect(bobFirstWallet).to.have.lengthOf(bobFirstCount);
      expect(bobFirstWallet[0]).to.equal(3);

      expect(await ad.mint(ownerSecondCount, { value: degenCost })).to.be.ok;
      const ownerSecondWallet = await ad.walletOfOwner(owner.address);
      expect(ownerSecondWallet).to.have.lengthOf(ownerFirstCount + ownerSecondCount);
      expect(ownerSecondWallet[0]).to.equal(1);
      expect(ownerSecondWallet[1]).to.equal(2);
      expect(ownerSecondWallet[2]).to.equal(4);
      expect(ownerSecondWallet[3]).to.equal(5);
      expect(ownerSecondWallet[4]).to.equal(6);
    });

  });

});