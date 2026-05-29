// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "./mock/ERC20.sol";
import {InsurancePool} from "../src/InsurancePool.sol";


import {console} from "forge-std/console.sol";
 

contract InsurancePoolTest  is Test {

    ERC20 public token;
    InsurancePool public insurancePool;

    address owner = makeAddr("owner");
    address user1 = makeAddr("user1");

    function setUp() public {
        token = new ERC20("Mock Token", "MTK", 18);
        insurancePool = new InsurancePool();
        insurancePool.setTokenAddress(address(token));
    }

    function depositTokenToContract(address provider, uint256 _amount) public {
        token.mint(provider, _amount);
        vm.startPrank(provider);
        token.approve(address(insurancePool), _amount);
        insurancePool.depositLiquidity(_amount);
        vm.stopPrank();
    }


    function testInsureAsset() public {
        depositTokenToContract(owner, 10000 * 10 ** 6);

        vm.startPrank(user1);
        token.mint(user1, 1000 * 10 ** 6);

        uint256 payoutAmount = 500 * 10 ** 6;
        uint256 policyDuration = 24 hours;

        console.log("Payout Amount: ", payoutAmount);
        uint256 policyTime = policyDuration / 1 hours;
        uint256 premium = insurancePool.calculatePremium(payoutAmount, policyTime);

        console.log("Calculated Premium: ", premium);

        token.approve(address(insurancePool), premium);

        InsurancePool.Policy memory policyInput;
        policyInput.triggerPrice = 200 * 10 ** 6;
        policyInput.payoutAmount = payoutAmount;
        policyInput.tokenInsured = "MTK";
        policyInput.insuranceCost = premium;
        policyInput.expiresAt = block.timestamp + policyDuration;

        insurancePool.insureAsset(policyInput);

        vm.stopPrank();
    }
    // Counter public counter;



    // function setUp() public {
    //     counter = new Counter();
    //     counter.setNumber(0);
    // }

    // function test_Increment() public {
    //     counter.increment();
    //     assertEq(counter.number(), 1);
    // }

    // function testFuzz_SetNumber(uint256 x) public {
    //     counter.setNumber(x);
    //     assertEq(counter.number(), x);
    
}
