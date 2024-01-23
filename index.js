const { ethers } = require("ethers");
const config = require("./config")
const { v4: uuidv4 } = require('uuid');
const Handlebars = require('handlebars');
const axios = require("axios");
const crypto = require("crypto")

// Connect to the node
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

// Create a wallet
const wallet = new ethers.Wallet(config.privateKey.trim(), provider);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInteger(minimum, maximum) {
  if (maximum === undefined) {
    maximum = minimum;
    minimum = 0;
  }

  if (typeof minimum !== 'number' || typeof maximum !== 'number') {
    throw new TypeError('Expected all arguments to be numbers');
  }

  return Math.floor(
      (Math.random() * (maximum - minimum + 1)) + minimum
  );
}

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}

async function checkAvaible(tokenJson){
  let hash = await sha256(tokenJson)
  let url = 'https://mainnet-api.ethscriptions.com/api/ethscriptions/exists/' + hash
  try {
    let response = await axios.get(url)
    return response.data.result === false;
  } catch (error) {
    console.log(error)
  }
  return false
}

// Convert to hexadecimal
const convertToHexa = (str = '') =>{
  return `0x${Buffer.from(str).toString('hex')}`
}

// Get the current account nonce
async function getCurrentNonce(wallet) {
  try {
    const nonce = await wallet.getTransactionCount("pending");
    console.log("Nonce:", nonce);
    return nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error.message);
    throw error;
  }
}

// Get the current mainnet gas price
async function getGasPrice() {
  const gasPrice = await provider.getGasPrice();
  return gasPrice;
}

// Get the real-time gasLimit on the chain
async function getGasLimit(hexData, address) {
  const gasLimit = await provider.estimateGas({
    to: address,
    value: ethers.utils.parseEther("0"),
    data: hexData,
  });

  return gasLimit.toNumber();
}

// Transaction transfer
async function sendTransaction(nonce) {
  let uuid = uuidv4()
  let hexData = config.tokenDataHex
  let tokenJson = config.tokenJson
  if (config.tokenJson !== '') {
    let template = Handlebars.compile(config.tokenJson.trim());
    let templateData = {"uuid": `${uuid}`}
    tokenJson = template(templateData);

    let id = randomInteger(config.tokenMinId, config.tokenMaxId)
    templateData = {"id": `${id}`}
    tokenJson = template(templateData);

    console.log("Inscription JSON data", tokenJson)

    if (config.tokenJson.indexOf("{{id}}") > 0) {
      let avaible = await checkAvaible(tokenJson)
      if (!avaible) {
        return
      }
    }

    hexData = convertToHexa(tokenJson);
    console.log("Inscription hexadecimal data", hexData)
  }
  // Get the real-time gasPrice
  const currentGasPrice = await getGasPrice();
  // Increase the gas price by a certain multiple
  const gasMultiple = parseInt(String(config.increaseGas * 100))
  const increasedGasPrice = currentGasPrice.div(100).mul(gasMultiple);
  // Get the wallet address
  let address = await wallet.getAddress();
  if (config.receiveAddress !== "") {
    address = config.receiveAddress;
  }
  // Get the current gasLimit limit
  const gasLimit = await getGasLimit(hexData, address);
  // Payment amount
  const payPrice = config.payPrice

  console.log("Inscription data being minted in hexadecimal", hexData)

  const transaction = {
    to: address,
	// Replace with the amount you want to transfer
    value: ethers.utils.parseEther(payPrice),
    // Hexadecimal data
    data: hexData,
    // Set nonce
    nonce: nonce,
    // Set gas price
    gasPrice: increasedGasPrice,
	// Limit gasLimit, set according to the current network transfer setting, if you don't know how much to set, go to the block explorer to see how much others have successfully transferred
    gasLimit: gasLimit,
  };

  try {
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    console.error(`Error in transaction with nonce ${nonce}:`, error.message);
  }
}

// Send multiple transactions
async function sendTransactions() {
  const currentNonce = await getCurrentNonce(wallet);
  const sleepTime = config.sleepTime

  for (let i = 0; i < config.repeatCount; i++) {
    await sendTransaction(currentNonce + i);
    await sleep(sleepTime)
  }
}

sendTransactions();
