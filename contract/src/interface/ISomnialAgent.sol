// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum ConsensusType { Majority, Threshold }
enum ResponseStatus {
    None,       // 0 - Default zero value (uninitialized storage)
    Pending,    // 1 - Awaiting responses
    Success,    // 2 - Consensus reached normally
    Failed,     // 3 - Validators reported failure
    TimedOut    // 4 - Request timed out
}

struct Response {
    address validator;
    bytes result;
    ResponseStatus status;
    uint256 receipt;
    uint256 timestamp;
    uint256 executionCost;
}

struct Request {
    uint256 id;
    address requester;
    address callbackAddress;
    bytes4 callbackSelector;
    address[] subcommittee;
    Response[] responses;
    uint256 responseCount;
    uint256 failureCount;
    uint256 threshold;
    uint256 createdAt;
    uint256 deadline;
    ResponseStatus status;
    ConsensusType consensusType;
    uint256 remainingBudget;   // escrow remaining at any point in the lifecycle
    uint256 perAgentBudget;    // max each elected member can claim (set at creation)
}

interface IAgentRequester {
    // Events
    event RequestCreated(uint256 indexed requestId, uint256 indexed agentId, uint256 perAgentBudget, bytes payload, address[] subcommittee);
    event RequestFinalized(uint256 indexed requestId, ResponseStatus status);
    event SubcommitteePaid(uint256 indexed requestId, uint256 totalPaid, uint256 perMember);
    event CommitteeDepositFailed(uint256 indexed requestId, uint256 attemptedAmount);

    // Request Creation (payable - sends budget upfront)
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId);

    function createAdvancedRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload,
        uint256 subcommitteeSize,
        uint256 threshold,
        ConsensusType consensusType,
        uint256 timeout
    ) external payable returns (uint256 requestId);

    // Query Functions
    function getRequest(uint256 requestId) external view returns (Request memory);
    function hasRequest(uint256 requestId) external view returns (bool);

    // Deposit helpers — query the exact msg.value required
    function getRequestDeposit() external view returns (uint256);
    function getAdvancedRequestDeposit(uint256 subcommitteeSize) external view returns (uint256);
}

interface IAgentRequesterHandler {
    function handleResponse(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory details
    ) external;
}

interface IJsonApiAgent {
    function fetchUint(string calldata url, string calldata selector, uint8 decimals)
        external returns (uint256);
}