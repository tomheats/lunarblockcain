const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool, wallet});
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

//-------API---------------

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const {blockData} = req.body;

  blockchain.addBlock({blockData});

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});

app.post('/api/make-transaction', (req, res) => {
  const {amount, recipient} = req.body;

  let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});

//wenn fehler sind -> nicht Tx Pool hinzufuegen
try{
  if(transaction){
    transaction.update({senderWallet: wallet, recipient, amount});
  } else{
    transaction = wallet.createTransaction({recipient, amount, chain: blockchain.chain});
  }
} catch(error){
  return res.status(400).json({type: 'error', message: error.message});
}

  transactionPool.setTransaction(transaction);

  res.json({ type: 'success', transaction});
});

app.get('/api/transaction-pool', (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions();

  res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;

  res.json({
    address,
    balance: Wallet.calculateBalance({chain: blockchain.chain, address})
  });
});

//synchronisiert tx pool und chain mit root node. wird von peer nodes beim start ausgefuehrt
const syncWithRootState = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('Ersetze chain waehrend Synchronisation mit', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionPoolMap = JSON.parse(body);

      console.log('Ersetze transasction pool waehrend Synchronisation mit', rootTransactionPoolMap);
      transactionPool.setMap(rootTransactionPoolMap);
    }
  });
};


let PEER_PORT;

//wenn peer port waehrend start gesetzt ist: zufaellige zahl zwischen 1 und 1000 also 30001 - 4000
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

//ein normaler start wird mit port 3000 starten, sonst peer port oder eigener
const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);

  //peer ports holen sich aktuellste version von Tx pool und Chain von Root node
  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});
