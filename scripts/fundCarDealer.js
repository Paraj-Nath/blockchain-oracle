//fundToken.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Replace these with your actual deployed contract addresses
  const mockLinkTokenAddress = "0x4Cbc0909F8BF3f7416A14968747e46e554A63242";
  const carDealerAddress = "0x6869B59B60C06F445491F8d145ABA63CCd66c8e0"; // Replace with your CarDealer contract address

  const amount = ethers.utils.parseUnits("100", 18); // Amount of LINK to transfer (100 LINK)

  // Get the contract instance
  const MockLinkToken = await ethers.getContractFactory("MockLinkToken");
  const mockLinkToken = MockLinkToken.attach(mockLinkTokenAddress);

  // Check deployer's balance
  const deployerBalance = await mockLinkToken.balanceOf(deployer.address);
  console.log("Deployer's LINK balance:", ethers.utils.formatUnits(deployerBalance, 18));

  // Transfer LINK to CarDealer contract
  const tx = await mockLinkToken.transfer(carDealerAddress, amount);
  await tx.wait();

  // Check CarDealer contract balance
  const carDealerBalance = await mockLinkToken.balanceOf(carDealerAddress);
  console.log("CarDealer's LINK balance:", ethers.utils.formatUnits(carDealerBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
