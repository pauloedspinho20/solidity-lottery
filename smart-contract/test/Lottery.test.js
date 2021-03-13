const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3( provider );
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach( async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});


describe('Lottery Contract', () => {

    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        // Send wei
        await lottery.methods.enter().send( {
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether') // avoid to enter wei directly
        });

        // Get list
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length)
    });

    it('allows multiple accounts to enter', async () => {
        // Send wei
        await lottery.methods.enter().send( {
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether') // avoid to enter wei directly
        });

        await lottery.methods.enter().send( {
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether') // avoid to enter wei directly
        });

        await lottery.methods.enter().send( {
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether') // avoid to enter wei directly
        });

        // Get list
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(accounts[1], players[1]);
        assert.strictEqual(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
        
    });


    it('requires a minimum ammount of ether to enter', async() => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 10
            });
            assert(false);
        }
        catch (err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async() => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            })
            assert(false);
        }
        catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async() => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});

