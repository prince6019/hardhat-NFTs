const { ethers } = require("hardhat");

networkConfig = {
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        subscriptionId: "7968",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        mintFee: ethers.utils.parseEther("0.01"),
        callBackGasLimit: "500000",
        priceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    31337: {
        name: "hardhat",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        mintFee: ethers.utils.parseEther("0.01"),
        interval: "30",
        callBackGasLimit: "500000",
    },
}
const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";

const developmentChains = ["hardhat", "localhost"];
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
}