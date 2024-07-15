// scripts/deployCarDealer.js

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CarDealer with the account:", deployer.address);

  const linkTokenAddress = "0x4Cbc0909F8BF3f7416A14968747e46e554A63242";  // Replace with actual deployed MockLinkToken address
  const oracleAddress = "0x0e65096276F066ECeB14A45f5472f97E8D22De96";  // Replace with your oracle address
  const weatherJobId = "9f94d57d81da45d1a0963abc8171ad4b";
  const drivingDataJobId = "535cfb63f6354f57a2dcdcb7803a2807";
  const ipfsCid = "QmVsnEgtGwTxXUX9YTnkH1FX5PgzkPAqrwcvj5tDAJVdmr";

  const CarDealer = await ethers.getContractFactory("CarDealer");
  const carDealer = await CarDealer.deploy(linkTokenAddress, oracleAddress, weatherJobId, drivingDataJobId, ipfsCid);

  console.log("CarDealer deployed to:", carDealer.address);

  // Authorize the MockOracle as a sender in CarDealer
  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mockOracle = await MockOracle.attach(oracleAddress); // Attach to the deployed MockOracle
  const tx = await mockOracle.setAuthorizedSender(carDealer.address);
  await tx.wait();
  console.log(`MockOracle at ${oracleAddress} authorized successfully in CarDealer.`);
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
