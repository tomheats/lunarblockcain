//1 Sekunde
const MINE_RATE = 1000;

//start wert fuer difficulty
//je hoeher desto schwieriger und laenger dauert es,
//einen erfolgreichen Hash zu finden
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: 1,
  previousHash: '-----',
  blockHash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  blockData: []
};

const STARTING_BALANCE = 1000;

const REWARD_INPUT = {address: '*mining-reward*'};

const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD
};
