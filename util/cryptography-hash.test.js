const cryptographyHash = require('./cryptography-hash');

describe('cryptographyHash()', () => {
  it('generiert einen SHA-256 Hashwert', () => {
    expect(cryptographyHash('foo'))
    .toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
  });

  it('produziert den selben Haswert, auch wenn die Reihenfolge geandert wird', () => {
    expect(cryptographyHash('one', 'two', 'three'))
    .toEqual(cryptographyHash('three', 'two', 'one'));
  });
});
