// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./interface/IERC20.sol";

contract InsurancePool {
    address public tokenAddress;

    struct Policy {
        address user; // address of the user who bought the insurance
        uint256 triggerPrice; // price at which the insurance will be triggered in wei
        uint256 payoutAmount; //amount to be paid out when the insurance is triggered in wei
        string tokenInsured; // token that is insured
        uint256 insuranceCost; // cost of the insurance in wei premium
        uint256 expiresAt; // timestamp when the insurance expires
        bool status; // status of the insurance (active or not)
    }

    uint256 ratePerHour = 3; //basis ppints per hour
    mapping(uint256 => Policy) public policies; // mapping of policy ID to Policy struct
    mapping(address user => uint256[]) public userPolicies; // mapping of user address to array of policy IDs

    uint256 public policyCount; // counter for policy IDs

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

    /**
     * @notice Insure Asset by adding it to the insurance  pool.
     */
    function insureAsset(
        Policy calldata policy
    ) external payable returns (bool) {
        if (policy.expiresAt <= block.timestamp) revert ExpiredTime();
        if (policy.payoutAmount <= 0) revert InvalidPayoutAmount();

        uint256 policyTime = (policy.expiresAt - block.timestamp) / 1 hours;
        uint256 premium = calculatePremium(
            policy.payoutAmount,
          
            policyTime
        );
        if (premium != policy.insuranceCost) revert IncorrectPremium();
        if (policy.triggerPrice <= 0) revert InvalidTriggerPrice();

        if (policy.expiresAt <= 0) revert invalidDutation();

        if (IERC20(tokenAddress).allowance(msg.sender, address(this)) < premium)
            revert IncorrectPremium();

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
            status: true
        });
     userPolicies[msg.sender].push(policyId);
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

    function processClaim(uint256 policyId, uint256 currentPrice) external {
        Policy storage policy = policies[policyId];

        if (policy.user == address(0)) revert PolicyNotFound();
        if (!policy.status) revert PolicyNotActive();
        if (block.timestamp > policy.expiresAt) revert PolicyExpired();

        // check if price has breached the trigger
        if (currentPrice > policy.triggerPrice) revert TriggerNotMet();

        // mark policy as inactive before transfer (reentrancy protection)
        policy.status = false;
        bool success = IERC20(tokenAddress).transfer(
            policy.user,
            policy.payoutAmount
        );
        if (!success) revert TransferFailed();

        emit PolicyClaimed(policyId, policy.user, policy.payoutAmount);
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
     * owner can withdraw funds from the insurance pool
     */

    function withdrawLiquidity(uint256 amount) external {
        if (IERC20(tokenAddress).balanceOf(address(this)) < amount) revert TransferFailed();
        bool success = IERC20(tokenAddress).transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    function setTokenAddress(address _tokenAddress) external {
        tokenAddress = _tokenAddress;
    }

}
