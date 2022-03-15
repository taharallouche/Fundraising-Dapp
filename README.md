# Tunisian Fundraising Ethereum Dapp
## Tahar Allouche
### Using Truffle, Ganache, Solidity, web3JS and ReactJS

This a Dapp where you can create fundraisers with specific attributes (name, webiste, image, ethereum address..) and people might donate the amount of their choice to support the projects that they like. All the transacted amounts are converted to TND (Tunisian Dinar) using the CryptoCompare API.

### Testing the Dapp locally.
after installing npm, ganache and truffle and pulling the repository you shoud:
- Start a local ganache blockchain
- Deploy the contracts into the local blockchain by typing into the terminal:
```bat
truffle migrate -network develop
```
- Go into the client directory directory:
```bat
cd client/
```
- Start the web application with the command:
```bat
npm run start
```
- Connect your Metamask wallet.
