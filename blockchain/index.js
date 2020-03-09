const Block = require('./block');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
const {cryptographyHash} = require('../util');
const {REWARD_INPUT, MINING_REWARD} = require('../config');

class Blockchain {
  constructor() {

    //genesis block
    this.chain = [Block.genesis()];
  }

  addBlock({blockData}){

    //mineBlock fuegt neuen block hinzu
    const newBlock = Block.mineBlock({
      //letzter Block
      previousBlock: this.chain[this.chain.length-1],
      blockData,
    });

    //fuegt den Block am Ende der Kette ein
    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransactions, onSuccess){
    //if(this.chain.length <= chain.length) return;

    if(!Blockchain.isValidChain(chain)) return;

    if(validateTransactions && !this.validTransactionData({chain})){
      console.error('die eingehende Chain verfuegt ueber korrupte Information');
      return;
    }

    if(onSuccess) onSuccess();
    console.log('Ersetze chain mit', chain);
    this.chain = chain;
  }

  //check valide transaktionen
  validTransactionData({chain}){
    for(let i=1;i<chain.length;i++){
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for(let transaction of block.blockData){
        if(transaction.input.address === REWARD_INPUT.address){
          rewardTransactionCount += 1;

          if(rewardTransactionCount > 1){
            console.error('miner rewards uebersteigen Input');
            return false;
          }

          if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
            console.error('miner reward Menge ist invalid');
            return false;
          }
        } else{
          if(!Transaction.validTransaction(transaction)){
            console.error('invalide Transaktion');
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });

          //if(transaction.input.amount !== trueBalance){
            //console.error('Invalide Input Menge');
            //return false;
          //}

          if(transactionSet.has(transaction)){
            console.error('eine idente Transaktion taucht mehr als nur einmal im Block auf');
            return false;
          } else{
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }
  static isValidChain(chain){

    //check, ob Kette mit Genesis Block startet
    //da 2 objekte nicht === sein koennen -> JSON.stringify
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

    //fuer jeden Block in der Kette: stimmen Hashes ueberein
    for(let i=1; i<chain.length; i++){
      const {timestamp, previousHash, blockHash, nonce, difficulty,blockData} = chain[i];

      const actualPreviousHash = chain[i-1].blockHash;
      const previousDifficulty = chain[i-1].difficulty;

      if(previousHash !== actualPreviousHash) return false;

      const validatedHash = cryptographyHash(timestamp, previousHash, blockData, nonce, difficulty);

      if(blockHash !== validatedHash) return false;

      //difficulty schwankungen vorbeugen, schwankungen duerfen nicht groesser als 1 sein
      if(Math.abs(previousDifficulty - difficulty) > 1) return false;
    }
    return true;
  }
}

//const blockchain1= new Blockchain();
//const  block1 = new Block({blockData: "foo"});
//const  block2 = new Block({blockData: "foo2"});
//const  block3 = new Block({blockData: "foo3"});

//blockchain1.addBlock(block1);
//blockchain1.addBlock(block2);
//blockchain1.addBlock(block3);

//console.log(blockchain1);

module.exports = Blockchain;
