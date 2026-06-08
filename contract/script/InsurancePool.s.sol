// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {InsurancePool} from "../src/InsurancePool.sol";
import {ERC20} from "../test/mock/ERC20.sol";
import {console} from "forge-std/console.sol";

contract InsurancePoolScript is Script {
    InsurancePool public insurancePool;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        ERC20 token = new ERC20("Mock Token", "MTK", 18);
        console.log("MockUSDT deployed at:", address(token));
        // insurancePool = new InsurancePool(address(token));

        vm.stopBroadcast();
    }
}
