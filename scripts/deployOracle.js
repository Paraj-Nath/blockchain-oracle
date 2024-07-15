// scripts/deployMockOracle.js
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Replace this with your LINK token address
    const linkTokenAddress = "0x4Cbc0909F8BF3f7416A14968747e46e554A63242";

    const MockOracle = await ethers.getContractFactory("MockOracle");
    const mockOracle = await MockOracle.deploy(linkTokenAddress);

    console.log("MockOracle deployed to:", mockOracle.address);

    // Authorize a Chainlink node
    const nodeAddress = "0xb95D8dDDA1D650fe745340C276d1Aea42381F368"; // Replace with the Chainlink node's Ethereum address
    const tx = await mockOracle.setAuthorizedSender(nodeAddress);
    await tx.wait();
    console.log(`Node address ${nodeAddress} authorized successfully.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
