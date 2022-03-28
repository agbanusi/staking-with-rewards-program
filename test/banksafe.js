const Banksafe = artifacts.require("BankSafe");
const Token = artifacts.require("ERC20Basic");
const truffleAssert = require("truffle-assertions");

contract("Test deposit", (accounts) => {
  let stakingToken;
  let bankSafe;
  const time = "120000";
  //const manyTokens = BigNumber(10).pow(18).multipliedBy(1000);
  const owner = accounts[0];
  const user = accounts[1];

  before(async () => {
    stakingToken = await Token.deployed();
    bankSafe = await Banksafe.deployed();
  });

  // const tokenInstance = await Token.new()
  // const banksafeInstance = await banksafe.new(tokenInstance.address,'120000');

  describe("users staking and withdrawing", async () => {
    beforeEach(async () => {
      stakingToken = await Token.new();
      bankSafe = await Banksafe.new(stakingToken.address, time);

      await stakingToken.transfer(user, "10000", { from: owner });
      await stakingToken.transfer(accounts[2], "10000", { from: owner });
      await stakingToken.approve(bankSafe.address, "10000", { from: user });
      await stakingToken.approve(bankSafe.address, "10000", { from: owner });
      await stakingToken.approve(bankSafe.address, "10000", {
        from: accounts[2],
      });
      await bankSafe.addToPool("1000", { from: owner });
      await bankSafe.depositToken("100", { from: user });
      await bankSafe.depositToken("100", { from: accounts[2] });
    });

    it("should allow deposit within first period", async () => {
      // Get information value
      assert.equal(
        await bankSafe.totalStaked(),
        "200",
        "Total staked must be 100"
      );
      assert.equal(
        await bankSafe.usersStaked(),
        "2",
        "Total users must be two"
      );
    });

    it("reject staking after set period", async () => {
      setTimeout(async () => {
        truffleAssert.reverts(
          await bankSafe.depositToken("100", { from: user }),
          "deposit period is expired"
        );
        // Get information value
        assert.equal(
          await bankSafe.totalStaked.call(),
          "100",
          "Total staked must be 100"
        );
      }, 200000);
    });

    it("should allow withdrawal after second period and give 20%", async () => {
      const formerBalance = await stakingToken.balanceOf(user);

      setTimeout(async () => {
        await bankSafe.withdrawToken("50", { from: user });
        // Get information value
        assert.equal(
          await bankSafe.totalStaked.call(),
          "150",
          "Total staked must be 100"
        );
        assert.equal(
          (await stakingToken.balanceOf(user)) - formerBalance,
          "150", //0.2*100/200*1000 = 150
          "Total users must be one"
        );
      }, 250000);
    });

    it("should not allow withdrawal before second period", async () => {
      setTimeout(async () => {
        truffleAssert.reverts(
          await bankSafe.withdrawToken("50", { from: user }),
          "Staking rewards not yet matured"
        );
        // Get information value
        assert.equal(
          await bankSafe.totalStaked.call(),
          "200",
          "Total staked must be 100"
        );
      }, 200000);
    });
  });

  it("should allow withdrawal after third period and give 30% + 20%", async () => {
    const formerBalance = await stakingToken.balanceOf(user);

    setTimeout(async () => {
      await bankSafe.withdrawToken("50", { from: user });
      // Get information value
      assert.equal(
        await bankSafe.totalStaked.call(),
        "150",
        "Total staked must be 100"
      );
      assert.equal(
        (await stakingToken.balanceOf(user)) - formerBalance,
        "300", //0.2*100/200*1000 = 150
        "Balance is not correct"
      );
    }, 370000);
  });

  it("should allow withdrawal after fourth period and give 50%+30%+20%", async () => {
    const formerBalance = await stakingToken.balanceOf(user);

    setTimeout(async () => {
      await bankSafe.withdrawToken("50", { from: user });
      // Get information value
      assert.equal(
        await bankSafe.totalStaked.call(),
        "50",
        "Total staked must be 100"
      );
      assert.equal(
        (await stakingToken.balanceOf(user)) - formerBalance,
        "550", //1*100/200*1000 = 150
        "Balance is not correct"
      );
    }, 490000);
  });

  it("allow withdrawal of excess funds if all users pull after fourth period", async () => {
    setTimeout(async () => {
      await bankSafe.withdrawToken("100", { from: user });
      // Get information value
      assert.equal(
        await bankSafe.totalStaked.call(),
        "600",
        "Total staked must be 100"
      );
      assert.equal(
        await bankSafe.usersStaked(),
        "1", //1*100/200*1000 = 150
        "Total users must be one"
      );
    }, 370000);

    setTimeout(async () => {
      await bankSafe.withdrawToken("100", { from: accounts[2] });
      await bankSafe.closeContract({ from: owner });

      assert.equal(
        await bankSafe.usersStaked(),
        "0",
        "Total users must be zero"
      );
    }, 490000);
  });

  it("reject withdrawal of excess funds if not all users pull after fourth period", async () => {
    setTimeout(async () => {
      await bankSafe.withdrawToken("50", { from: user });
      // Get information value
      assert.equal(
        await bankSafe.totalStaked.call(),
        "550",
        "Total staked must be 100"
      );
      assert.equal(
        await bankSafe.usersStaked(),
        "1", //1*100/200*1000 = 150
        "Total users must be one"
      );
    }, 370000);

    setTimeout(async () => {
      await bankSafe.withdrawToken("100", { from: accounts[2] });
      await bankSafe.closeContract({ from: owner });

      assert.equal(
        await bankSafe.usersStaked(),
        "1",
        "Total users must be zero"
      );
    }, 490000);
  });
});
