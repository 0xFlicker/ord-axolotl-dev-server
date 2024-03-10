#!/bin/bash

RECEIVE_ADDRESS=$(ord --regtest wallet --server-url http://127.0.0.1:5000 receive | jq -r '.address')

CBOR_INSCRIPTION=$(ord --regtest wallet --server-url http://127.0.0.1:5000 inscribe --fee-rate 1 --postage 546sat --file inscribe-me/cbor.js)
CBOR_INSCRIPTION_ID=$(echo $CBOR_INSCRIPTION | jq -r '.inscriptions[0].id')

PARENT_INSCRIPTION=$(ord --regtest wallet --server-url http://127.0.0.1:5000 inscribe --fee-rate 1 --postage 2048sat --file inscribe-me/layer-parent.webp)
PARENT_INSCRIPTION_ID=$(echo $PARENT_INSCRIPTION | jq -r '.inscriptions[0].id')

echo "CBOR Inscription ID: $CBOR_INSCRIPTION_ID"
echo "Parent Inscription ID: $PARENT_INSCRIPTION_ID"


mkdir -p tmp
echo '{"cborInscriptionId": "'$CBOR_INSCRIPTION_ID'", "layerParentInscriptionId": "'$PARENT_INSCRIPTION_ID'"}' > tmp/inscription-ids.json


bitcoin-cli -regtest generatetoaddress 1 ${RECEIVE_ADDRESS} > /dev/null
node scripts/prepare-batch.js
bitcoin-cli -regtest generatetoaddress 1 ${RECEIVE_ADDRESS} > /dev/null
