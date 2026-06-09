// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./interface/IERC20.sol";
import "./interface/ISomnialAgent.sol";

contract InsurancePool {
    address public tokenAddress;
    address public owner;

    IAgentRequester public platform =
        IAgentRequester(0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776);

    uint256 public constant JSON_API_AGENT_ID = 13174292974160097713; // Replace with actual agent ID from the web app
    uint256 public constant LLM_INFERENCE_AGENT_ID = 128472938475610293840;
    uint256 public constant LLM_PARSE_WEBSITE_AGENT_ID = 12875401142070969085;
    uint256 public constant SUBCOMMITTEE_SIZE = 3; // matches the platform default
    uint256 public constant JSON_FETCH_COST_PER_AGENT = 30000000000000000; // see Gas Fees → Current Per-Agent Prices

    struct Policy {
        address user; // address of the user who bought the insurance
        uint256 triggerPrice; // price at which the insurance will be triggered in wei
        uint256 payoutAmount; //amount to be paid out when the insurance is triggered in wei
        string tokenInsured; // token that is insured
        uint256 insuranceCost; // cost of the insurance in wei premium
        uint256 expiresAt; // timestamp when the insurance expires
        PolicyStatus status; // status of the insurance (active or not)
    }

    enum PolicyStatus {
        Pending,
        Active,
        Claimed,
        Expired
    }
    uint256 ratePerHour = 3; //basis ppints per hour
    mapping(uint256 => Policy) public policies; // mapping of policy ID to Policy struct
    mapping(address user => uint256[]) public userPolicies; // mapping of user address to array of policy IDs

    mapping(string tokenSymbol => string coinGeckoId) public tokenToCoinGeckoId; // mapping of supported token symbols to their CoinGecko IDs

    uint256 public policyCount; // counter for policy IDs

    mapping(uint256 => bool) public pendingRequests;

    mapping(string token => uint256) public latestPricePerToken;

    mapping(uint256 => string) public requestToToken;

    mapping(uint256 => uint256) public requestToPolicyId;
    // requestId → policyId — to know which policy to activate or reject

    // events
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed user,
        uint256 triggerPrice,
        uint256 payoutAmount,
        string tokenInsured,
        uint256 insuranceCost,
        uint256 expiresAt
    );

    event PolicyClaimed(
        uint256 indexed policyId,
        address indexed user,
        uint256 payoutAmount
    );

    event LiquidityDeposited(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed provider, uint256 amount);
    event PriceReceived(uint256 indexed requestId, uint256 price);
    event PolicyRejected(uint256 indexed policyId, string reason);

    event PolicyActivated(uint256 indexed policyId, uint256 currentPrice);
    event PolicyExpiredE(uint256 indexed policyId, string reason);
    // errors

    error IncorrectPremium();
    error ExpiredTime();
    error InvalidTriggerPrice();
    error InvalidPayoutAmount();
    error invalidDutation();
    error TransferFailed();

    error PolicyNotFound();
    error PolicyNotActive();
    error PolicyExpired();
    error TriggerNotMet();

    error InsufficientAgentFunds();
    error UnsupportedToken();
    error NotOwner();

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
        owner = msg.sender;
    }
    /**
     * @notice Insure Asset by adding it to the insurance  pool.
     */
    function insureAsset(Policy calldata policy) external returns (bool) {
        if (!isTokenSupported(policy.tokenInsured)) revert UnsupportedToken();
        if (policy.expiresAt <= block.timestamp) revert ExpiredTime();
        if (policy.payoutAmount <= 0) revert InvalidPayoutAmount();

        uint256 policyTime = (policy.expiresAt - block.timestamp) / 1 hours;
        uint256 premium = calculatePremium(policy.payoutAmount, policyTime);
        if (premium != policy.insuranceCost) revert IncorrectPremium();
        if (policy.triggerPrice <= 0) revert InvalidTriggerPrice();

        if (policy.expiresAt <= 0) revert invalidDutation();

        if (IERC20(tokenAddress).allowance(msg.sender, address(this)) < premium)
            revert IncorrectPremium();

        // check contract has enough STT for agent call
        if (address(this).balance < _getAgentDeposit())
            revert InsufficientAgentFunds();

        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            premium
        );
        if (!success) revert TransferFailed();

        uint256 policyId = policyCount + 1;

        policies[policyId] = Policy({
            user: msg.sender,
            triggerPrice: policy.triggerPrice,
            payoutAmount: policy.payoutAmount,
            tokenInsured: policy.tokenInsured,
            insuranceCost: premium,
            expiresAt: policy.expiresAt,
            status: PolicyStatus.Pending
        });
        userPolicies[msg.sender].push(policyId);

        uint256 requestId = _fetchCurrentPrice(policy.tokenInsured);
        requestToToken[requestId] = policy.tokenInsured;
        requestToPolicyId[requestId] = policyId;
        emit PolicyCreated(
            policyId,
            msg.sender,
            policy.triggerPrice,
            policy.payoutAmount,
            policy.tokenInsured,
            policy.insuranceCost,
            policy.expiresAt
        );

        return true;
    }

    /**
     *
     */
    function calculatePremium(
        uint256 payoutAmount,
        uint256 policyDuration
    ) public view returns (uint256) {
        return (payoutAmount * ratePerHour * policyDuration) / 10000;
    }

    /**
     * only agent can call function
     */

    function checkPolicy(uint256 policyId) external {
        Policy storage policy = policies[policyId];

        if (policy.user == address(0)) revert PolicyNotFound();
        if (policy.status != PolicyStatus.Active) revert PolicyNotActive();
        if (block.timestamp > policy.expiresAt) revert PolicyExpired();
        if (address(this).balance < _getAgentDeposit())
            revert InsufficientAgentFunds();

        // check if price has breached the trigger
        // if (currentPrice > policy.triggerPrice) revert TriggerNotMet();
        uint256 requestId = _fetchCurrentPrice(policy.tokenInsured);
        requestToPolicyId[requestId] = policyId;
    }

    /**
     * owner deposit tokens to the insurance pool to ensure there are enough funds to pay out claims
     */

    function depositLiquidity(uint256 amount) external {
        if (IERC20(tokenAddress).allowance(msg.sender, address(this)) < amount)
            revert IncorrectPremium();

        bool success = IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) revert TransferFailed();
        emit LiquidityDeposited(msg.sender, amount);
    }

    /**
     * Add supported token
     * onlyOwner function
     */

    function addSupportedToken(
        string calldata tokenSymbol,
        string calldata coinGeckoId
    ) external {
        _onlyOwner();
        tokenToCoinGeckoId[tokenSymbol] = coinGeckoId;
    }

    // isTokenn supported
    function isTokenSupported(
        string calldata tokenSymbol
    ) public view returns (bool) {
        return bytes(tokenToCoinGeckoId[tokenSymbol]).length > 0;
    }

    function getUserPolicies(
        address user
    ) external view returns (uint256[] memory) {
        return userPolicies[user];
    }
    
    // get supported token's CoinGecko ID
    function getCoinGeckoId(
        string calldata tokenSymbol
    ) external view returns (string memory) {
        return tokenToCoinGeckoId[tokenSymbol];
    }

    function setRatePerHour(uint256 newRate) external {
        _onlyOwner();
        ratePerHour = newRate;
    }

    function withdraw(uint256 amount) external {
        _onlyOwner();
        if (address(this).balance < amount) revert TransferFailed();
        (bool success, ) = payable(owner).call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    function fund() external payable {
        require(msg.value > 0, "Must send STT");
    }
    /**
     * owner can withdraw funds from the insurance pool
     */

    function withdrawLiquidity(uint256 amount) external {
        _onlyOwner();
        if (IERC20(tokenAddress).balanceOf(address(this)) < amount)
            revert TransferFailed();
        bool success = IERC20(tokenAddress).transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    function setTokenAddress(address _tokenAddress) external {
        _onlyOwner();
        tokenAddress = _tokenAddress;
    }

    // internal functions
    function _getAgentDeposit() internal view returns (uint256) {
        return
            platform.getRequestDeposit() +
            (JSON_FETCH_COST_PER_AGENT * SUBCOMMITTEE_SIZE);
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }
    function _fetchCurrentPrice(
        string memory token
    ) internal returns (uint256 requestId) {
        string memory coinGeckoId = tokenToCoinGeckoId[token];

        bytes memory payload = abi.encodeWithSelector(
            IJsonApiAgent.fetchUint.selector,
            string(
                abi.encodePacked(
                    "https://api.coingecko.com/api/v3/simple/price?ids=",
                    coinGeckoId,
                    "&vs_currencies=usd"
                )
            ),
            string(abi.encodePacked(coinGeckoId, ".usd")),
            uint8(8)
        );

        uint256 reserve = platform.getRequestDeposit();
        uint256 reward = JSON_FETCH_COST_PER_AGENT * SUBCOMMITTEE_SIZE;
        uint256 deposit = reserve + reward;

        requestId = platform.createRequest{value: deposit}(
            JSON_API_AGENT_ID,
            address(this),
            this.handleResponse.selector,
            payload
        );
        requestToToken[requestId] = token;
        pendingRequests[requestId] = true;
    }

    // Callback function - called by the platform when consensus is reached
    function handleResponse(
        uint256 requestId,
        Response[] memory responses,
        ResponseStatus status,
        Request memory // details
    ) external {
        require(msg.sender == address(platform), "Only platform can call");
        require(pendingRequests[requestId], "Unknown request");

        delete pendingRequests[requestId];

        if (status == ResponseStatus.Success && responses.length > 0) {
            uint256 currentPrice = abi.decode(responses[0].result, (uint256));

            string memory token = requestToToken[requestId];

            latestPricePerToken[token] = currentPrice;

            uint256 policyId = requestToPolicyId[requestId];
            Policy storage policy = policies[policyId];

            if (policy.status == PolicyStatus.Pending) {
                if (currentPrice <= policy.triggerPrice) {
                    policy.status = PolicyStatus.Expired;
                    bool refundSuccess = IERC20(tokenAddress).transfer(
                        policy.user,
                        policy.insuranceCost
                    );
                    if (!refundSuccess) revert TransferFailed();
                    emit PolicyRejected(policyId, "Trigger already breached");
                    return;
                }
                policy.status = PolicyStatus.Active;
                emit PolicyActivated(policyId, currentPrice);
            } else if (policy.status == PolicyStatus.Active) {
                if (block.timestamp > policy.expiresAt) {
                    policy.status = PolicyStatus.Expired;
                    emit PolicyExpiredE(policyId, "Policy expired");
                    return;
                }

                // if price has breached the trigger, mark policy as expired (cannot be claimed)
                if (currentPrice <= policy.triggerPrice) {
                    policy.status = PolicyStatus.Claimed;
                    bool success = IERC20(tokenAddress).transfer(
                        policy.user,
                        policy.payoutAmount
                    );
                    if (!success) revert TransferFailed();

                    emit PolicyClaimed(
                        policyId,
                        policy.user,
                        policy.payoutAmount
                    );
                }
            }

            emit PriceReceived(requestId, currentPrice);
        }
    }

    receive() external payable {}
}
