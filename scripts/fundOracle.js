const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Replace these with your actual deployed contract addresses
  const mockLinkTokenAddress = "0x4Cbc0909F8BF3f7416A14968747e46e554A63242";
  const mockOracleAddress = "0x0e65096276F066ECeB14A45f5472f97E8D22De96"; // Replace with your MockOracle contract address

  const amount = ethers.utils.parseUnits("100", 18); // Amount of LINK to transfer (100 LINK)

  // Get the contract instance
  const MockLinkToken = await ethers.getContractFactory("MockLinkToken");
  const mockLinkToken = MockLinkToken.attach(mockLinkTokenAddress);

  // Check deployer's balance
  const deployerBalance = await mockLinkToken.balanceOf(deployer.address);
  console.log("Deployer's LINK balance:", ethers.utils.formatUnits(deployerBalance, 18));

  // Transfer LINK to MockOracle contract
  const tx = await mockLinkToken.transfer(mockOracleAddress, amount);
  await tx.wait();

  // Check MockOracle contract balance
  const mockOracleBalance = await mockLinkToken.balanceOf(mockOracleAddress);
  console.log("MockOracle's LINK balance:", ethers.utils.formatUnits(mockOracleBalance, 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
