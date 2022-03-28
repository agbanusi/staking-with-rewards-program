pragma solidity >=0.4.25 <0.9.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BankSafe.sol";

contract TestBankPool {
  function testInitialBalanceUsingDeployedContract() public{
    BankSafe meta = BankSafe(DeployedAddresses.BankSafe());

    uint expected = 0;

    Assert.equal(meta.totalStaked(), expected, "Contract should have 0 StakedCoin initially");
    Assert.equal(meta.usersStaked(), expected, "Contract should have 0 StakedCoin initially");
  }

}