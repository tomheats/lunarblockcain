# lunarblockcain
blockchain in js

## installation
npm install

## start
run root node
```
npm run dev
```
run peer node
```
npm run dev-peer
```

The communication works with PubNub so you probably need credentials in order to use it. You can do this here: (https://www.pubnub.com)
## api
The following api requests can be done by any node. If the peer node makes a new transaction the root node can mine it & visa verca. If the root node makes a transaction you can have a look into the transaction pool of the root node. The nodes will propagate the longest chain and exchange data between them.

#### get the blocks of the current chain [GET]
```
/api/blocks
```
#### get the balance of current wallet [GET]
```
/api/wallet-info
```

#### make a new transaction [POST]
```
/api/make-transaction
```
example of a transaction with raw JSON data
```json
{
	"recipient": "bar",
	"amount": 49
}
```
#### get current transaction pool [GET]
```
/api/transaction-pool
```

#### mine a transaction and append it to the block [GET]
```
/api/mine-transactions
```
