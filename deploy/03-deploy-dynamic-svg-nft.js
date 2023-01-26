const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;

    let pricefeedAddress;

    if (developmentChains.includes(network.name)) {
        const mockV3aggregator = await ethers.getContract("MockV3Aggregator");
        pricefeedAddress = mockV3aggregator.address;
    } else {
        pricefeedAddress = networkConfig[chainId]["priceFeedAddress"];
    }

    const lowSvg = fs.readFileSync("./images/DynamicNft/frown.svg", { encoding: "utf8" });
    const highSvg = fs.readFileSync("./images/DynamicNft/happy.svg", { encoding: "utf8" });

    const args = [
        pricefeedAddress,
        lowSvg,
        highSvg
    ]
    log("deploying Dynamic SVG Contract ------------------");

    const dynamicSVG = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        args: args
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSVG.address, args);
    }
}

module.exports.tags = ["all", "dynamicSvg"];