const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config;

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

async function storeImages(imagesFilePath) {
    const fullImagePath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagePath);
    let responses = [];
    console.log("Uploading to IPFS");
    for (index in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[index]}`);
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile);
            responses.push(response);
        } catch (e) {
            console.log(e);
        }
    }
    return { responses, files };
}

async function storeTokenUriMetadata(tokenUriMetadata) {
    try {
        const response = pinata.pinJSONToIPFS(tokenUriMetadata);
        return response;
    }
    catch (e) {
        console.log(e);
    }
    return null;
}
module.exports = { storeImages, storeTokenUriMetadata };