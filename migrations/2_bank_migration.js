var Migrations = artifacts.require("BankSafe");

module.exports = function (deployer) {
  // Deploy the Migrations contract as our only task
  deployer
    .deploy(
      Migrations,
      "0xFab46E002BbF0b4509813474841E0716E6730136",
      "1036800000" // 10days
    )
    .then((res) => {
      console.log(res);
    });

  // const instance = await MyContract.deployed();
  // console.log({instance})
};
