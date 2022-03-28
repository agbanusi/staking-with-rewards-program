import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { tokenABI } from "./abi";
const contract = require("@truffle/contract");
const artifact1 = require("./BankSafe.json");
const ContractAddress = "0xa129c73e976633415C3c03D7F886BDeafF6A35f9";
const token = "0xFab46E002BbF0b4509813474841E0716E6730136";
declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [amount, setAmount] = useState("0");
  const [response, setResponse] = useState("");
  const [success, setSuccess] = useState(false);

  async function send(transaction: any, account: any) {
    return await transaction.send({ from: account });
  }

  async function getTokenExchange(
    uniswap: any,
    address: any,
    account: any,
    web3: any
  ) {
    //console.log(uniswap.methods)
    //let val = 10 ** 18;
    try {
      let exchange = await send(
        uniswap.methods.approve(address, web3.utils.toWei(amount, "ether")),
        account
      );
      //console.log(exchange);
      return exchange;
    } catch (e) {
      //console.log(e);
      return e;
    }
  }

  const approveTokenTransferMetamask = async (
    address: any,
    token?: string,
    num: number = 0
  ) => {
    var web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();

    const account = accounts[num];
    web3.eth.handleRevert = true;

    const swap = new web3.eth.Contract(JSON.parse(tokenABI), token);
    await getTokenExchange(swap, address, account, web3);
  };

  async function sendTransactionMetamask() {
    let ethereum = window?.ethereum;
    if (ethereum && typeof ethereum !== "undefined") {
      const chainId = await ethereum.request({ method: "eth_chainId" });
      if (parseInt(chainId, 16) == 4) {
        var web3 = new Web3(window.ethereum);
        const LTS = contract(artifact1);
        LTS.setProvider(web3.currentProvider);
        web3.eth.handleRevert = true;
        web3.eth.transactionPollingTimeout = 30000;
        const accounts = await web3.eth.getAccounts();
        const lts = await LTS.at(ContractAddress);

        try {
          let bs;
          setResponse("waiting for approval transaction to be completed! ...");
          await approveTokenTransferMetamask(ContractAddress, token);
          setResponse("waiting for staking transaction to be completed! ...");
          bs = await lts.depositToken(web3.utils.toWei(amount, "ether"), {
            from: accounts[0],
          });

          setSuccess(true);
          setResponse("successful at " + bs.tx);
        } catch (e: any) {
          setSuccess(false);
          console.log(e);
          setResponse("unsuccessfull");
        }
      } else {
        setSuccess(false);
        setResponse("Switch to Rinkeby network please.");
      }
    } else {
      setSuccess(false);
      setResponse(
        "Connect to metamask wallet first by clicking connect with metamask button"
      );
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Stake Faucet Token </p>
        <h3 style={success ? { color: "green" } : {}}>{response}</h3>
        <img src={logo} className="App-logo" alt="logo" />
        <input
          style={{
            backgroundColor: "inherit",
            height: "2.5rem",
            borderRadius: "1rem",
            padding: "1rem",
            fontSize: "1.5rem",
            width: "500px",
            color: "white",
          }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          style={{
            backgroundColor: "green",
            marginTop: "2rem",
            height: "3rem",
            borderRadius: "1rem",
            width: "200px",
            color: "white",
          }}
          onClick={() => sendTransactionMetamask()}
        >
          Stake
        </button>
      </header>
    </div>
  );
}

export default App;
