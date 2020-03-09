const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {
  let blockchain, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();

    originalChain = blockchain.chain;
  });

  it('enthaelt eine `chain` array Instanz', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('beginnt mit dem genesis BLock', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('fuegt einen neuen Block hinzu', () => {
    const newBlockData = 'foo bar';
    blockchain.addBlock({blockData: newBlockData});

    expect(blockchain.chain[blockchain.chain.length-1].blockData).toEqual(newBlockData);
  });

  describe('isValidChain()', () => {
    describe('wenn die Chain nicht mit Genesis Block beginnt', () => {
      it('gibt FALSE zurueck', () => {
        blockchain.chain[0] = {blockData: 'fake-genesis'};

        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('wenn die Chain mit Genesis Block beginnt und mehrere Bloecke hat', () => {
      beforeEach(() => {
        blockchain.addBlock({blockData: 'bears'});
        blockchain.addBlock({blockData: 'cats'});
        blockchain.addBlock({blockData: 'mouse'});
      });

      describe('und previousHash veraendert sich', () => {
        it('returns false', () => {

          blockchain.chain[2].previousHash = 'broken-hash';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('und die chain beinhaltet einen Block mit einem ungueltigen Feld', () => {
        it('returns false', () => {

          blockchain.chain[2].blockData = 'broken data';

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('und die Chain verfuegt ueber keine ungueltigen Bloecke', () => {
        it('returns true', () => {

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe('replaceChain()', () => {
    describe('wenn die Kette nicht laenger ist', () => {
      it('ersetzt die Kette NICHT', () => {
        newChain.chain[0] = {new: 'chain'};

        blockchain.replaceChain(newChain.chain);

        expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe('wenn die Kette laenger ist', () => {
      beforeEach(() => {
        newChain.addBlock({blockData: 'bears'});
        newChain.addBlock({blockData: 'cats'});
        newChain.addBlock({blockData: 'mouse'});
      });

      describe('und die Kette invalid ist', () => {
        it('ersetzt sie nicht', () => {
          newChain.chain[2].blockHash = 'fake-hash';

          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe('und die Kette valide ist', () => {
        it('ersetzt sie', () => {
          blockchain.replaceChain(newChain.chain);

          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});
