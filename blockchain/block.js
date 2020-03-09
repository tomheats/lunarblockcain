const hexToBinary = require('hex-to-binary');
const {GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptographyHash} = require('../util');
const Blockchain = require('./index');
class Block{
  constructor({timestamp, previousHash, blockHash, blockData, nonce, difficulty}){
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.blockHash = blockHash;
    this.blockData = blockData; //muessen nicht zwingend transaktionsobjekte sein
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  //Erzeugen von Genesis Block
  static genesis(){
    return new this (GENESIS_DATA);
  }

  static mineBlock({previousBlock, blockData}){
    const previousHash = previousBlock.blockHash;

    let blockHash, timestamp;
    let {difficulty} = previousBlock;
    let nonce = 0;

    do{
      nonce ++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({originalBlock: previousBlock, timestamp});

      //hash des derzeitigen blocks
      blockHash = cryptographyHash(timestamp, previousHash, blockData, nonce, difficulty);

      //waehrend der derzeitige hash nicht mit anzahl von Nullen der Difficulty uebereinstimmt
      //nonce = nonce + 1
      //da binaer-schreibweise eine zu grosse anzahl an 0 und 1 in den Hash des derzeitigen blocks schreiben wuerde
      //wird nur wahrend dem Berechnen des Hashes beim PoW hexToBinary verwendet, um eine groessere
      //Anzahl an 0 zu haben und somit ist mehr Spielraum fuer die Difficulty, die die Anzahl an 0 vorschreibt
      //Der Hash an sich wird jedoch in HEXA in den Block gespeichert.
    } while(hexToBinary(blockHash).substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this({timestamp, previousHash, blockData, difficulty, nonce, blockHash});
  }

  //dynamische anpassung der difficulty
  static adjustDifficulty({originalBlock, timestamp}){
    const { difficulty } = originalBlock;

    //vermeiden, dass difficulty negativ oder 0 wird
    if (difficulty < 1) return 1;

    //da MINE_RATE 1 sekunde ist, muss bei einer Dauer von mehr als 1 sekunde die difficulty um 1 gesenkt werden
    if ((timestamp - originalBlock.timestamp) > MINE_RATE ) return difficulty - 1;

    //sollte die Minerate kleiner als 1 sekunde sein, wird die difficulty um 1 erhoeht
    return difficulty + 1;
  }
}

module.exports = Block;
