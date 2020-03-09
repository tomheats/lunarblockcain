const uuid = require('uuid/v1');
const {verifySignature} = require('../util');
const {REWARD_INPUT, MINING_REWARD} = require('../config');

class Transaction{
  constructor({senderWallet, recipient, amount, outputMap, input}){

    //jede transaktion hat eine ID, um identifiziert zu werden
    this.id = uuid();
    this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
    this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
  }

  createOutputMap({senderWallet, recipient, amount}){
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({senderWallet, outputMap}){
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      //als addresse wird der public Key herangezogen
      address: senderWallet.publicKey,
      //output map ist data fuer die Sign Methode
      signature: senderWallet.sign(outputMap)
    };
  }

  //fuegt einer Transaktion mehr Outputs hinzu
  update({senderWallet, recipient, amount}){
    if(amount > this.outputMap[senderWallet.publicKey]){
      throw new Error('Menge uebersteigt Guthaben');
    }

    if(!this.outputMap[recipient]){
      this.outputMap[recipient] = amount;
    } else{
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({senderWallet, outputMap: this.outputMap});
  }

  static validTransaction(transaction) {
    const { input: { address, amount, signature }, outputMap } = transaction;

    //reduziert array auf einen wert
    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);

    //amount darf nicht groesser oder kleiner wie outputs sein
    if (amount !== outputTotal) {
      console.error(`Invalide Transaktion von ${address}`);
      return false;
    }

    //check korrekte Signatur
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalide Signatur von ${address}`);
      return false;
    }

    return true;
  }

  //mining belohnung
  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD }
    });
  }
}

module.exports = Transaction;
