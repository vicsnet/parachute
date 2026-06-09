// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "./mock/ERC20.sol";
import {InsurancePool} from "../src/InsurancePool.sol";

import {console} from "forge-std/console.sol";

contract InsurancePoolTest is Test {
    ERC20 public token;
    InsurancePool public insurancePool;

    // address owner = makeAddr("owner");
    address user1 = makeAddr("user1");

    address payable constant POOL_ADDRESS =
        payable(0xF0e14bC1D098701EEc491da6A2599b0b6dA96413); // your deployed InsurancePool
    address constant TOKEN_ADDRESS = 0x7Bd0E4FD28C3226e53670A34B57eb8Ae8b06a622; // your deployed MockUSDT
    address constant owner = 0x61c4B3621640Bbbe128e97DCfF24f4FEAc897006;

    function setUp() public {
        // token = new ERC20("Mock Token", "MTK", 18);
        token = ERC20(TOKEN_ADDRESS);

        insurancePool = InsurancePool(POOL_ADDRESS);

        uint256 poolCode = address(POOL_ADDRESS).code.length;
        uint256 tokenCode = address(TOKEN_ADDRESS).code.length;

        console.log("Pool code size:", poolCode);
        console.log("Token code size:", tokenCode);

        // vm.startPrank(owner);
        // // insurancePool = new InsurancePool(address(token));
        // vm.stopPrank();

        // insurancePool.setTokenAddress(address(token));
    }

    function depositTokenToContract(address provider, uint256 _amount) public {
        token.mint(provider, _amount);
        vm.startPrank(provider);
        token.approve(address(insurancePool), _amount);
        insurancePool.depositLiquidity(_amount);
        vm.stopPrank();
    }

    function testInsureAsset() public {
        vm.deal(owner, 10 ether);
        vm.startPrank(owner);
        depositTokenToContract(owner, 10000 * 10 ** 6);
        vm.stopPrank();
        insurancePool.fund{value: 5 ether}();
        vm.prank(owner);
        insurancePool.addSupportedToken("ETH", "Ethereum");

        vm.startPrank(user1);
        token.mint(user1, 1000 * 10 ** 6);

        uint256 payoutAmount = 500 * 10 ** 6;
        uint256 policyDuration = 24 hours;

        console.log("Payout Amount: ", payoutAmount);
        uint256 policyTime = policyDuration / 1 hours;
        uint256 premium = insurancePool.calculatePremium(
            payoutAmount,
            policyTime
        );

        console.log("Calculated Premium: ", premium);

        token.approve(address(insurancePool), premium);

        InsurancePool.Policy memory policyInput;
        policyInput.triggerPrice = 200 * 10 ** 6;
        policyInput.payoutAmount = payoutAmount;
        policyInput.tokenInsured = "ETH";
        policyInput.insuranceCost = premium;
        policyInput.expiresAt = block.timestamp + policyDuration;

        insurancePool.insureAsset(policyInput);

        vm.stopPrank();
    }

    // function testProcessClaim() public{
    //     // testInsureAsset();
    //     uint256 price= 200 * 10 ** 6;
    //     // insurancePool.processClaim(1, price);
    //     //  insurancePool.processClaim(1, price);
    // }
}
