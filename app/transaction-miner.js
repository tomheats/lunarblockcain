const Transaction = require('../wallet/transaction');

class TransactionMiner{
  constructor({blockchain, transactionPool, wallet, pubsub}){
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions(){
    const validTransactions = this.transactionPool.validTransactions();

    //Mine reward generieren
    validTransactions.push(
      Transaction.rewardTransaction({minerWallet: this.wallet})
    );

    //fuegt neuen block hinzu
    this.blockchain.addBlock({blockData: validTransactions});

    //chain publishen
    this.pubsub.broadcastChain();

    //Tx pool leeren
    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
