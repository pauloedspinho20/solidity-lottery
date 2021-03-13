const HDWalletProvider = require('truffle-hdwallet-provider'); // instead of ganache
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    'jelly gossip resist music dance cigar aisle cactus energy east salmon alter',
    'https://rinkeby.infura.io/v3/4fa03dfc1695418a854034b7c0f19730'
);

const web3 = new Web3(provider);

const deploy = async() => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    // OLD truffle-hdwallet-provider

    /* const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ['Hi there!'] })
    .send({ gas: '1000000', from: accounts[0] }); */

    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: '0x' + bytecode }) // add 0x bytecode
    .send({ from: accounts[0]}); // remove 'gas'

    console.log('Contract deployed to', result.options.address);
}

deploy();
