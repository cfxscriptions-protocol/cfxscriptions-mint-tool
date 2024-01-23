# EVM-Compatible Inscription Automated Mint Script

## 🛠 Instructions

### Step 1: First, install Node.js

Go to the Node.js official website and download the version for your operating system.

```bash
https://nodejs.org/en

```bash
https://nodejs.org/en
```

Then check the installed version to see if the installation was successful.

```bash
node -v
npm -v
```

If you prefer using yarn, you can install it with:
```bash
npm i -g yarn
```

### Step 2: Download the script source code
First, use git clone to clone the source code to your local machine.
```bash
git clone https://github.com/sfter/evm-inscription-mint.git

cd evm-inscription-mint
```
If you are using a Windows computer and haven't installed git, download and install the git software from the link below.
```bash
https://gitforwindows.org
```

### Step 3: Rename the config.js.example in the current directory to config.js
```bash
cp config.js.example config.js
```

### Step 4: Modify the config.js configuration file in the current directory
```javascript
const config = {
    // Set the number of times you want to mint. It is advised not to exceed 50 at a time to avoid transaction failures.
    repeatCount: 1,

    // Increase the gas by a certain multiple based on the current gas
    increaseGas: 1.2,

    // Your wallet's private key
    privateKey: "",

    // Inscription JSON data (replace with the inscription JSON data you want to mint)
    tokenJson: 'data:,{"p":"cfxs-20","op":"mint","tick":"CFXS","amt":"1000"}',

    // RPC node 
    rpcUrl: "https://evm.confluxrpc.com"
}
```

### Step 5: Install dependencies
```bash
npm i
```
or
```bash
yarn install
```

### Step 6: Run the Mint script
```shell
node index.js
```
or
```shell
yarn start
```
or
```shell
npm run start
```