//fulfillData.js
const { ethers } = require("hardhat");
const axios = require("axios");
const { create } = require("ipfs-http-client");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Fulfilling requests with the account:", deployer.address);

  const mockOracleAddress = "0x0e65096276F066ECeB14A45f5472f97E8D22De96"; // Replace with your deployed MockOracle contract address
  const weatherRequestId = "0x07e093c4a7e9c30d9dd54dfd2e0d8fe2118fab90ddf0345c5dc827e2ae879179"; // Replace with your actual weather request ID
  const drivingRequestId = "0x6dd2057a425b4c743874453d3ddf5244681f3727dfadcd0e5675d8fcb087658d"; // Replace with your actual driving request ID
  const city = "New York"; // Example city
  const apiKey = "0de53e6bb7db7e4eac6b50fa745beb0b"; // Replace with your actual OpenWeather API key
  const ipfsUrl = "http://localhost:5001"; // Local IPFS URL
  const ipfsHash = "QmVsnEgtGwTxXUX9YTnkH1FX5PgzkPAqrwcvj5tDAJVdmr"; // Replace with your actual IPFS hash

  const MockOracle = await ethers.getContractFactory("MockOracle");
  const mockOracle = await MockOracle.attach(mockOracleAddress);

  // Fetch weather data from the external adapter
  try {
    const weatherResponse = await axios.post("http://localhost:8080", {
      id: weatherRequestId,
      city: city,
      apiKey: apiKey,
    });

    const weatherData = weatherResponse.data.data.result;
    const temperature = Math.round(weatherData.main.temp * 100); // Multiply by 100 to handle as integer
    const humidity = Math.round(weatherData.main.humidity * 100); // Multiply by 100 to handle as integer
    const windSpeed = Math.round(weatherData.wind.speed * 100); // Multiply by 100 to handle as integer

    console.log("Fulfilling weather data request...");
    const weatherTx = await mockOracle.fulfillRequest(
      weatherRequestId,
      temperature,
      humidity,
      windSpeed,
      { gasLimit: 10000000 }
    );
    await weatherTx.wait();
    console.log("Weather data fulfilled:", weatherTx.hash);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }

  // Fetch driving data from IPFS
  try {
    const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });
    let fileData = '';
    for await (const chunk of ipfs.cat(ipfsHash)) {
      fileData += chunk.toString();
    }

    const drivers = JSON.parse(fileData);
    const driver = drivers.drivers[0]; // Example: using the first driver's data

    console.log("Fulfilling driving data request...");
    const drivingTx = await mockOracle.fulfillDrivingRequest(
      drivingRequestId,
      driver.sa,
      driver.sd,
      driver.srt,
      driver.slt,
      { gasLimit: 10000000 }
    );
    await drivingTx.wait();
    console.log("Driving data fulfilled:", drivingTx.hash);
  } catch (error) {
    console.error("Error fetching driving data:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
