const { developmentChains } = require("../../../smart-contract-lottery/helper-hardhat-config");
const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");



!developmentChains.includes(network.name) ?
    describe.skip :
    describe("basicNft", () => {
        let deployer, basicNft;
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["basicnft"]);
            basicNft = await ethers.getContract("BasicNft")
        })

        describe("Constructor", () => {
            it("intializes the nft correctly", async () => {
                const name = await basicNft.name();
                const symbol = await basicNft.symbol();
                const tokenCounter = await basicNft.getTokenCounter();
                assert.equal(name, "Dogie");
                assert.equal(symbol, "buff");
                assert.equal(tokenCounter.toString(), "0");

            })
        })
        describe("mintNft", () => {

            it("allows user to mint nfts and updates appropriately", async () => {
                await basicNft.mintNft();
                const tokenCounter = await basicNft.getTokenCounter();
                assert.equal(tokenCounter, 1);

            })
        })
    })