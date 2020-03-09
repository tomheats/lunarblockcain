const EC = require('elliptic').ec;
const cryptographyHash = require('./cryptography-hash');

//elliptische kurven
const ec = new EC('secp256k1');

//validierung benoetigt pub key, transaktionen und signatur
const verifySignature = ({publicKey, data, signature}) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

  //kein private key wird gespeichert -> erhoeht sicherheitsrisiko
  return keyFromPublic.verify(cryptographyHash(data), signature);
};

module.exports = {ec, verifySignature, cryptographyHash};
