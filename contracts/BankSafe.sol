// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";


interface Token {
    function transfer(address dst, uint wad) external returns (bool);
    function balanceOf(address guy) external view returns (uint);
    function transferFrom(address _from, address _to, uint _value)external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function allowance(address owner, address spender) external returns (uint256);
}

contract Destructible is Ownable {

  constructor() payable { }

  /**
   * @dev Transfers the current balance to the owner and terminates the contract.
   */
  function destroy() onlyOwner public  payable{
    address finalOwner = owner();
    selfdestruct(payable(finalOwner));
  }

  function destroyAndSend(address _recipient) onlyOwner public {
    selfdestruct(payable(_recipient));
  }
}


contract BankSafe is Destructible{
    address mainOwner;
    uint256 public timelock;
    uint256 public poolAmount = 0;
    uint256 public startTime = block.timestamp;
    uint256 public setTime;
    uint256 public totalStaked=0;
    uint256 public usersStaked=0;
    address public tokenAddress;
    
    struct User {
        address userAddress;
        uint tokenAmount;
        bool available;
    }
    mapping (address=>User) public user;
    event Deposited(address user, uint256 amount);
    event Withdrawn(address user, uint256 amount);
    event PoolUpgraded(uint256 amount);
    
    constructor(address _tokenAddress, uint256 _setTime){
        mainOwner = msg.sender;
        timelock = block.timestamp + _setTime;
        setTime = _setTime;
        tokenAddress = _tokenAddress;
    }

    receive() external payable{
        revert();
    }

    function depositToken(uint256 _amount) depositOnly public{
        Token token = Token(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= _amount, "Not enough token allowance");

        token.transferFrom(msg.sender, address(this), _amount);
        if(!user[msg.sender].available){
            user[msg.sender] = User(msg.sender, _amount, true);
            usersStaked+=1;
        }else{
            uint256 formerAmount = user[msg.sender].tokenAmount;
            user[msg.sender] = User(msg.sender, _amount+formerAmount, true);
        }

        totalStaked += _amount;
        emit Deposited(msg.sender, _amount);
    }

    function addToPool(uint256 _amount) onlyOwnerAllowed public{
        Token token = Token(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= _amount, "Not enough token allowance");

        token.transferFrom(msg.sender, address(this), _amount);
        poolAmount += _amount;
        emit PoolUpgraded(_amount);
    }

    function withdrawToken(uint256 _amount) withdrawOnly public{
        uint256 rewards = getRewards(msg.sender);
        uint256 totalWithdrawToken = rewards + _amount;
        uint256 formerAmount = user[msg.sender].tokenAmount;
        require(_amount <= formerAmount, "You cannpt withdraw more than you deposited");
        Token token = Token(tokenAddress);
        token.transfer(msg.sender, totalWithdrawToken);
        poolAmount -= rewards;
        if(_amount == formerAmount){
            usersStaked -=1;
            user[msg.sender] = User(msg.sender, 0, false);
        }else{
            user[msg.sender] = User(msg.sender, formerAmount - _amount, true);
        }
        
        emit Withdrawn(msg.sender, totalWithdrawToken);
    }

    function getRewards(address _user) internal view returns(uint256){
        uint256 userStaked = user[_user].tokenAmount;
        uint256 userRatio = userStaked / totalStaked; //in 10**18 so decimal is almost avoidabal is insignificant
        uint256 timeSpent = block.timestamp - startTime;
        uint256 rewardsRatio = 0;

        if(timeSpent > 2 * setTime){
            rewardsRatio += 20;
        }

        if(timeSpent > 3 * setTime){
            rewardsRatio += 30;
        }

        if(timeSpent > 4 * setTime){
            rewardsRatio += 50;
        }

        uint256 totalRatio = (rewardsRatio * userRatio)/100;
        uint256 rewards = totalRatio * poolAmount;

        return rewards;
    }

    function closeContract() public onlyOwnerAllowed{
        uint256 timeSpent = block.timestamp - startTime;
        if(timeSpent > 4 * setTime && usersStaked == 0){
            Token token = Token(tokenAddress);
            token.transfer(mainOwner, token.balanceOf(address(this)));
            destroy();
        }
    }
    
    modifier onlyOwnerAllowed {
        require(mainOwner == msg.sender, "unauthorized caller");
        _;
    }

    modifier depositOnly {
        require((block.timestamp - startTime) <= setTime, "deposit period is expired");
        _;
    }

    modifier withdrawOnly {
        require((block.timestamp - startTime) > 2 * setTime, "Staking rewards not yet matured");
        _;
    }
}