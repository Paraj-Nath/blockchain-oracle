// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import { ConfirmedOwner } from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./CarDealer.sol"; // Import CarDealer contract

contract MockOracle is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    mapping(bytes32 => address) private pendingRequests;
    mapping(address => bool) public authorizedSenders; // Mapping for authorized senders

    event RequestFulfilled(bytes32 indexed requestId);

    constructor(address _link) ConfirmedOwner(msg.sender) {
        _setChainlinkToken(_link);
    }

    function setAuthorizedSender(address _nodeAddress) public onlyOwner {
        authorizedSenders[_nodeAddress] = true;
    }

    function fulfillRequest(bytes32 _requestId, uint256 _temperature, uint256 _humidity, uint256 _windSpeed) public recordChainlinkFulfillment(_requestId) {
        require(authorizedSenders[msg.sender], "Caller is not authorized");
        emit RequestFulfilled(_requestId);
        CarDealer(pendingRequests[_requestId]).fulfillWeatherData(_requestId, _temperature, _humidity, _windSpeed);
        delete pendingRequests[_requestId];
    }

    function fulfillDrivingRequest(bytes32 _requestId, string memory _data) public recordChainlinkFulfillment(_requestId) {
        require(authorizedSenders[msg.sender], "Caller is not authorized");
        emit RequestFulfilled(_requestId);
        CarDealer(pendingRequests[_requestId]).fulfillDrivingData(_requestId, _data);
        delete pendingRequests[_requestId];
    }

    function requestData(Chainlink.Request memory req, uint256 payment) public onlyOwner {
        bytes32 requestId = _sendChainlinkRequest(req, payment);
        pendingRequests[requestId] = msg.sender;
    }
}
