var Migrations = artifacts.require("ERC20Basic");

module.exports = function (deployer) {
  // Deploy the Migrations contract as our only task
  deployer.deploy(Migrations).then((res) => {
    console.log(res);
  });

  // const instance = await MyContract.deployed();
  // console.log({instance})
};
