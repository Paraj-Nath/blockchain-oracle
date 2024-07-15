// fundNode.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Replace this with your actual Chainlink node address
  const chainlinkNodeAddress = "0xb95D8dDDA1D650fe745340C276d1Aea42381F368"; // Update with full address

  // Amount of ETH to transfer (0.1 ETH in this example)
  const amount = ethers.utils.parseEther("5.0"); // Adjust the amount as needed

  // Check deployer's ETH balance
  const deployerBalance = await deployer.getBalance();
  console.log("Deployer's ETH balance:", ethers.utils.formatEther(deployerBalance));

  // Ensure deployer has enough balance to cover the transfer and gas fee
  if (deployerBalance.lt(amount)) {
    console.error("Insufficient balance to fund the Chainlink node");
    return;
  }

  // Transfer ETH to Chainlink node address
  const tx = await deployer.sendTransaction({
    to: chainlinkNodeAddress,
    value: amount,
  });
  await tx.wait();

  // Check Chainlink node's ETH balance
  const chainlinkNodeBalance = await ethers.provider.getBalance(chainlinkNodeAddress);
  console.log("Chainlink Node's ETH balance:", ethers.utils.formatEther(chainlinkNodeBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
