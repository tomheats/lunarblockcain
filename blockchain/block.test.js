const hexToBinary = require('hex-to-binary');
const Block = require('./Block');
const {GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptographyHash} = require('../util');

describe('Block', () => {
  const timestamp = 2000;
  const previousHash = 'foo-hash';
  const blockHash = 'foo-blockhash';
  const blockData = ['foo-tx1', 'foo-tx2'];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({timestamp, previousHash, blockHash, blockData, nonce, difficulty});

  it('hat timestamp, previous hash, current block hash, und data', () =>{
    expect(block.timestamp).toEqual(timestamp);
    expect(block.previousHash).toEqual(previousHash);
    expect(block.blockHash).toEqual(blockHash);
    expect(block.blockData).toEqual(blockData);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('genesis block ist Instanz der Block Klasse', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('gibt GENESIS DATA zurueck', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const previousBlock = Block.genesis();
    const blockData = 'mined data';
    const minedBlock = Block.mineBlock({previousBlock, blockData});

    it('ist Instanz der Block Klasse', () =>{
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('setzt den `previousHash` als `blockHash` des vorherigen Blocks', () => {
      expect(minedBlock.previousHash).toEqual(previousBlock.blockHash);
    });

    it('setzt die `blockData`', () =>{
      expect(minedBlock.blockData).toEqual(blockData);
    });

    it('setzt einen `timestamp`', () =>{
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('erstellt einen SHA-256 `blockHash` basierend auf den Input', () => {
      expect(minedBlock.blockHash)
      .toEqual(
        cryptographyHash(minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          previousBlock.blockHash,
          blockData
        )
      );
    });

    it('setzt einen `blockHash` der die Kriterien der Difficulty erfuelllt', () => {
      expect(hexToBinary(minedBlock.blockHash).substring(0, minedBlock.difficulty))
      .toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('passt die Difficulty an', () => {
      const possibleResults = [previousBlock.difficulty+1, previousBlock.difficulty-1];

      expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe('adjustDifficulty', () => {
    it('erhoeht difficulty bei schneller geminten Bloecken', () =>{
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE - 100
      })).toEqual(block.difficulty+1);
    });

    it('senkt die Difficulty bei langsam geminten Bloecken', () =>{
      expect(Block.adjustDifficulty({
        originalBlock: block, timestamp: block.timestamp + MINE_RATE + 100
      })).toEqual(block.difficulty-1);
    });

    it('das untere Limit ist 1', () => {
      block.difficulty = -1;

      expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
    });
  });
});
