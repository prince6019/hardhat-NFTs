const { assert, expect } = require("chai");
const { ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ?
    describe.skip :
    describe("random Ipfs NFT", () => {
        let deployer, randomIpfsNft, vrfCoordinatorV2Mock;
        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["mocks", "randomNfts"]);
            randomIpfsNft = await ethers.getContract("RandomIpfsNft");
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        })

        describe("Constructor", () => {
            it("initializes everything correctly", async () => {
                const tokenCounter = await randomIpfsNft.getTokenCounter();
                const tokenUris = await randomIpfsNft.getDogTokenUris(0);
                assert.equal(tokenCounter, 1);
                assert(tokenUris.includes("ipfs://"));
            })

        })
        describe("request NFT", () => {
            it("reverts if amount is small than mint fee", async () => {
                const amount = ethers.utils.parseEther("0.001");
                await expect(randomIpfsNft.requestNft({ value: amount })).to.be.revertedWith("RandomIpfs__NeedMoreEthSent");
            })
            it("emits request Id", async () => {
                const amount = ethers.utils.parseEther("0.1");
                await expect(randomIpfsNft.requestNft({ value: amount })).to.emit(randomIpfsNft, "NftRequested");
            })
        })

        describe("fulfillrandomWords", () => {
            it("mints the nft after random number is returned", async () => {

                await new Promise(async (resolve, reject) => {
                    randomIpfsNft.once("Nft emitted", async () => {
                        try {
                            const tokenUri = await randomIpfsNft.getDogTokenUris(0);
                            const tokenCounter = await randomIpfsNft.getTokenCounter();
                            assert.equal(tokenCounter, 1);
                            assert.equal(tokenUri.includes("ipfs://"), true);
                            resolve();
                        } catch (e) {
                            console.log(e);
                            reject(e);
                        }
                    })
                    const fee = await randomIpfsNft.getMintFee();
                    const requestNftResponse = await randomIpfsNft.requestNft(fee);
                    const requestNftResponseReceipt = requestNftResponse.wait(1);
                    vrfCoordinatorV2Mock.fulfillRandomWords(
                        requestNftResponseReceipt.events[1].args.requestId,
                        randomIpfsNft.address
                    );
                })
            })
        })

        describe("getBreedFromModdedRng", () => {
            it("should return pug when moddedRng <10", async () => {
                const moddedRng = await randomIpfsNft.getBreedFromModdedRng(4);
                assert.equal(moddedRng, 0);
            })

            it("should return st.Bernard when moddedRng <40 and >10", async () => {
                const moddedRng = await randomIpfsNft.getBreedFromModdedRng(25);
                assert.equal(moddedRng, 1);
            })

            it("should return shiba Inu when moddedRng <100 and >30", async () => {
                const moddedRng = await randomIpfsNft.getBreedFromModdedRng(74);
                assert.equal(moddedRng, 2);
            })
            it("should revert if moddedRng > 99", async function () {
                await expect(randomIpfsNft.getBreedFromModdedRng(101)).to.be.revertedWith(
                    "RandomIpfsNft__RangeOutOfBounds"
                )
            })

        })
    })