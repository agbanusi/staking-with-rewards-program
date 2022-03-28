# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Make sure to install globally

- Truffle from npm registry eg npm i -g truffle
- Ganache from npm registry eg npm i -g ganache

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
Connect your metamask wallet and enter an amount to stake and click on stake.

### Testing with yarn test

Run `ganache` in a terminal
and then in another terminal run `yarn test`

This launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Live test

To test the contract go to https://rinkeby.etherscan.io/address/0xa129c73e976633415C3c03D7F886BDeafF6A35f9

Token is at 0xFab46E002BbF0b4509813474841E0716E6730136 , you can get some from https://erc20faucet.com/

Contract is at contract/BankSafe.sol and deployed at 0xa129c73e976633415C3c03D7F886BDeafF6A35f9 with 10 days set Time period

Better GUI might be added in the future

### Deployment to Rinkeby/ test networks

Fill in the .env file and convert to .json using name `.secrets.json`, then run `truffle migrate --reset --network rinkeby`.
You can update the `2_bank_migration.js` file in the migrations folder to token of choice and set time of choice in milliseconds.
