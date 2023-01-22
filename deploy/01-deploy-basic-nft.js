const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    const args = [];
    log("deploying basicNft contract ------------");

    const BasicNft = await deploy("BasicNft", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("------------------------------");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying ---------");
        await verify(BasicNft.address, arguments);
    }

    log("---------------------------------");
}

module.exports.tags = ["all", "basicnft"];