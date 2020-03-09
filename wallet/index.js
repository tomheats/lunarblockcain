const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const {ec, cryptographyHash} = require('../util');

class Wallet{
  constructor(){
    this.balance = STARTING_BALANCE;

    this.keyPair = ec.genKeyPair();

    this.publicKey = this.keyPair.getPublic().encode('hex');

    //aus sicherheitsgruenden wird getPrivate() nicht angewandt
  }

  sign(data){
    return this.keyPair.sign(cryptographyHash(data));
  }

  createTransaction({recipient, amount, chain}){
    if(chain){
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }

    if(amount > this.balance){
      throw new Error('Menge uebersteigt Guthaben');
    }

    return new Transaction({senderWallet: this, recipient, amount});
  }

  //loop fuer jede transaktion in der chain
  //outputs werden zu outputsTotal hinzugefuegt
  static calculateBalance({chain, address}){
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    //von hinten die kette durchgehen, da es wahrscheinlicher ist,
    //dass eine transaktion vor kurzem gemacht wurde
    //i > 0, da genesis block nicht gezaehlt wird
    for(let i=chain.length-1; i>0;i--){
      const block = chain[i];

      for(let transaction of block.blockData){
        if(transaction.input.address === address){
          //addresse hat eine transaktion gemacht
          hasConductedTransaction = true;
        }

        const addressOutput = transaction.outputMap[address];

        if(addressOutput){
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if(hasConductedTransaction){
        break;
      }
    }

    //wenn wallet bereits eine transaktion gemacht hat -> Starting Balance nicht mehr dazu zaehlen
    //sondern nur die outputs. Wenn dies nicht der Fall ist -> Starting Balance und Outputs
    return hasConductedTransaction ? outputsTotal: STARTING_BALANCE + outputsTotal;
  }
};

module.exports = Wallet;
