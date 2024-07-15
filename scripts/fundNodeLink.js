const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding Chainlink node with the account:", deployer.address);

  // Replace these with your actual deployed contract addresses
  const mockLinkTokenAddress = "0x4Cbc0909F8BF3f7416A14968747e46e554A63242"; // Replace with your MockLinkToken contract address
  const chainlinkNodeAddress = "0xb95D8dDDA1D650fe745340C276d1Aea42381F368"; // Replace with your Chainlink node's Ethereum address

  const amount = ethers.utils.parseUnits("100", 18); // Amount of LINK to transfer (100 LINK)

  // Get the contract instance
  const MockLinkToken = await ethers.getContractFactory("MockLinkToken");
  const mockLinkToken = MockLinkToken.attach(mockLinkTokenAddress);

  // Check deployer's balance
  const deployerBalance = await mockLinkToken.balanceOf(deployer.address);
  console.log("Deployer's LINK balance:", ethers.utils.formatUnits(deployerBalance, 18));

  // Transfer LINK to Chainlink node
  const tx = await mockLinkToken.transfer(chainlinkNodeAddress, amount);
  await tx.wait();

  // Check Chainlink node balance
  const nodeBalance = await mockLinkToken.balanceOf(chainlinkNodeAddress);
  console.log("Chainlink node's LINK balance:", ethers.utils.formatUnits(nodeBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
