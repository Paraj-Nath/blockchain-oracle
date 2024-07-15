// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract CarDealer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 LINK
    bytes32 public lastRequestId;
    address public oracle;
    string public weatherJobId;
    string public drivingDataJobId;
    string public ipfsCid;

    event WeatherDataRequested(bytes32 indexed requestId, address indexed requester, string location);
    event DrivingDataRequested(bytes32 indexed requestId, address indexed requester);
    event WeatherDataReceived(bytes32 indexed requestId, uint256 temperature, uint256 humidity, uint256 windSpeed);
    event DrivingDataReceived(bytes32 indexed requestId, string data);

    constructor(address _link, address _oracle, string memory _weatherJobId, string memory _drivingDataJobId, string memory _ipfsCid) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link); // LINK token address for MockLinkToken
        oracle = _oracle;
        weatherJobId = _weatherJobId;
        drivingDataJobId = _drivingDataJobId;
        ipfsCid = _ipfsCid;
    }

    struct UserProfile {
        string location;
        uint256 temperature;
        uint256 humidity;
        uint256 windSpeed;
        uint256 datasetScore;
        uint256 drivingExperienceScore;
    }

    struct DrivingData {
        uint256 sa; // Sudden Accelerations
        uint256 sd; // Sudden Decelerations
        uint256 srt; // Sudden Right Turns
        uint256 slt; // Sudden Left Turns
    }

    mapping(address => UserProfile[3]) public userProfiles;
    mapping(address => DrivingData[3]) public userDrivingData;
    mapping(bytes32 => uint8) private requestIdToDriverIndex;

    function requestWeatherData(string memory _location, uint8 driverIndex) public {
        require(driverIndex < 3, "Driver index out of bounds");
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(weatherJobId),
            address(this),
            this.fulfillWeatherData.selector
        );
        req._add("city", _location);
        req._add("apiKey", "0de53e6bb7db7e4eac6b50fa745beb0b"); // Replace with your actual OpenWeather API key
        lastRequestId = _sendChainlinkRequestTo(oracle, req, ORACLE_PAYMENT);

        requestIdToDriverIndex[lastRequestId] = driverIndex;
        emit WeatherDataRequested(lastRequestId, msg.sender, _location);
    }

    function requestDrivingData(uint8 driverIndex) public {
        require(driverIndex < 3, "Driver index out of bounds");
        Chainlink.Request memory req = _buildChainlinkRequest(
            stringToBytes32(drivingDataJobId),
            address(this),
            this.fulfillDrivingData.selector
        );
        req._add("cid", ipfsCid);
        lastRequestId = _sendChainlinkRequestTo(oracle, req, ORACLE_PAYMENT);

        requestIdToDriverIndex[lastRequestId] = driverIndex;
        emit DrivingDataRequested(lastRequestId, msg.sender);
    }

    function fulfillWeatherData(bytes32 _requestId, uint256 temperature, uint256 humidity, uint256 windSpeed) public recordChainlinkFulfillment(_requestId) {
        uint8 driverIndex = getDriverIndex(_requestId);
        UserProfile storage profile = userProfiles[msg.sender][driverIndex];
        profile.temperature = temperature;
        profile.humidity = humidity;
        profile.windSpeed = windSpeed;
        profile.drivingExperienceScore = evaluateDrivingExperience(profile.temperature, profile.humidity, profile.windSpeed, profile.datasetScore);

        emit WeatherDataReceived(_requestId, temperature, humidity, windSpeed);
    }

    function fulfillDrivingData(bytes32 _requestId, string memory data) public recordChainlinkFulfillment(_requestId) {
        uint8 driverIndex = getDriverIndex(_requestId);
        (uint256 sa, uint256 sd, uint256 srt, uint256 slt) = parseDrivingData(data);
        userDrivingData[msg.sender][driverIndex] = DrivingData(sa, sd, srt, slt);

        UserProfile storage profile = userProfiles[msg.sender][driverIndex];
        profile.datasetScore = evaluateDatasetScore(sa, sd, srt, slt);
        profile.drivingExperienceScore = evaluateDrivingExperience(profile.temperature, profile.humidity, profile.windSpeed, profile.datasetScore);

        emit DrivingDataReceived(_requestId, data);
    }

    function evaluateDatasetScore(uint256 sa, uint256 sd, uint256 srt, uint256 slt) internal pure returns (uint256) {
        uint256 score = 100;
        score -= sa * 2; // Deduct 2 points for each Sudden Acceleration
        score -= sd * 2; // Deduct 2 points for each Sudden Deceleration
        score -= srt * 1; // Deduct 1 point for each Sudden Right Turn
        score -= slt * 1; // Deduct 1 point for each Sudden Left Turn
        return score;
    }

    function evaluateDrivingExperience(uint256 temperature, uint256 humidity, uint256 windSpeed, uint256 datasetScore) internal pure returns (uint256) {
        uint256 score = datasetScore;
        if (temperature > 303 || temperature < 273) {
            score -= 30; // Uncomfortable temperature
        }
        if (humidity > 70) {
            score -= 20; // High humidity
        }
        if (windSpeed > 10) {
            score -= 20; // High wind speed
        }
        return score;
    }

    function parseDrivingData(string memory data) internal pure returns (uint256, uint256, uint256, uint256) {
        bytes memory dataBytes = bytes(data);
        uint256 sa;
        uint256 sd;
        uint256 srt;
        uint256 slt;

        for (uint i = 0; i < dataBytes.length; i++) {
            if (dataBytes[i] == '"') {
                i++;
                if (dataBytes[i] == 's' && dataBytes[i + 1] == 'a') {
                    sa = extractUintValue(dataBytes, i + 4);
                } else if (dataBytes[i] == 's' && dataBytes[i + 1] == 'd') {
                    sd = extractUintValue(dataBytes, i + 4);
                } else if (dataBytes[i] == 's' && dataBytes[i + 1] == 'r' && dataBytes[i + 2] == 't') {
                    srt = extractUintValue(dataBytes, i + 5);
                } else if (dataBytes[i] == 's' && dataBytes[i + 1] == 'l' && dataBytes[i + 2] == 't') {
                    slt = extractUintValue(dataBytes, i + 5);
                }
            }
        }

        return (sa, sd, srt, slt);
    }

    function extractUintValue(bytes memory data, uint index) internal pure returns (uint256) {
        uint256 value = 0;
        while (data[index] != ',' && data[index] != '}' && index < data.length) {
            value = value * 10 + (uint256(uint8(data[index])) - 48); // ASCII '0' is 48
            index++;
        }
        return value;
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function getDriverIndex(bytes32 _requestId) internal view returns (uint8) {
        return requestIdToDriverIndex[_requestId];
    }
    
    function setOracle(address _oracle) public onlyOwner {
        oracle = _oracle;
    }

    function setWeatherJobId(string memory _jobId) public onlyOwner {
        weatherJobId = _jobId;
    }

    function setDrivingDataJobId(string memory _jobId) public onlyOwner {
        drivingDataJobId = _jobId;
    }

    function setIpfsCid(string memory _ipfsCid) public onlyOwner {
        ipfsCid = _ipfsCid;
    }
}
