const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");
const imageFileLocation = "./images/randomNftImage";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_types: "Cuteness",
            value: 100,
        }
    ]
}


module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
    let tokenUris;

    // get the IPFS hashes of our images

    if (process.env.UPDATE_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    let VRFCoordinatorAddress, subscriptionId;
    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock");
        VRFCoordinatorAddress = VRFCoordinatorMock.address;
        const tx = await VRFCoordinatorMock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;

        await VRFCoordinatorMock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT);

    } else {
        VRFCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[chainId]["subscriptionId"];
    }



    const args = [
        VRFCoordinatorAddress,
        subscriptionId,
        networkConfig[chainId]["callBackGasLimit"],
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["mintFee"],
        tokenUris,
    ];
    log("Deploying Random Nft Contract --------------");

    const RandomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, RandomIpfsNft.address)
    }

    log("----------------------------");
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ---------");
        await verify(RandomIpfsNft.address, args);
    }

}

async function handleTokenUris() {
    let tokenUris = [];

    // store the image in IPFS 
    // Store the metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imageFileLocation);
    for (imgageIndex in imageUploadResponses) {
        // create the metadata
        // upload the metadata

        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[imgageIndex].replace(".png", "");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imgageIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}....`);
        const metadataUploadResponses = await storeTokenUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponses.IpfsHash}`);
    }
    console.log("Token Uris Uploaded");
    console.log(tokenUris);

    return tokenUris;
}

module.exports.tags = ["all", "randomNfts"];