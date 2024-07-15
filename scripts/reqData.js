// scripts/requestData.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const carDealerAddress = "0x6869B59B60C06F445491F8d145ABA63CCd66c8e0"; // CarDealer contract address

  const CarDealer = await ethers.getContractFactory("CarDealer");
  const carDealer = CarDealer.attach(carDealerAddress);

  // Request weather data for each driver
  const drivers = ["Driver-1", "Driver-2", "Driver-3"];
  for (let i = 0; i < drivers.length; i++) {
    const tx = await carDealer.requestWeatherData("San Francisco", i); // Replace with actual location
    await tx.wait();
    console.log(`Weather data requested for ${drivers[i]}`);
  }

  // Request driving data for each driver
  for (let i = 0; i < drivers.length; i++) {
    const tx = await carDealer.requestDrivingData(i);
    await tx.wait();
    console.log(`Driving data requested for ${drivers[i]}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
