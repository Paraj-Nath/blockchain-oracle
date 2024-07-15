//deployMockLinkToken.js
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const MockLinkToken = await ethers.getContractFactory("MockLinkToken");
    const mockLinkToken = await MockLinkToken.deploy();
    await mockLinkToken.deployed();
  
    console.log("MockLinkToken deployed to:", mockLinkToken.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  