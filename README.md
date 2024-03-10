# Axolotl Ordinal Dev Server

Creates a local environment for testing and developing recursive HTML ordinals

## Pre-reqs

You will need a local bitcoin regtest and ord indexer running

- Download and install bitcoin core: https://bitcoin.org/en/download
- Download and install ord: https://github.com/ordinals/ord

Create a starter .bitcoin.conf:

```bash
mkdir -p ~/.bitcoin/bitcoin.conf
cat << EOF > ~/.bitcoin/bitcoin.conf
[regtest]
  txindex=1
  prune=0
  server=1
  rpcallowip=127.0.0.0/8
  rpcbind=127.0.0.1
EOF
```

Start bitcoind:

```bash
bitcoind -regtest
```

To get things started, create a new receive address in ord and mine some blocks, then send to the ordinal wall

You made need to delete any existing ord index. See https://docs.ordinals.com/guides/reindexing.html for locations.

```bash
ord --regtest wallet create
export ORDINAL_ADDRESS=$(ord --regtest wallet receive | jq -r .address)
bitcoin-cli -regtest generatetoaddress 101 ${ORDINAL_ADDRESS}
ord --regtest index update
```

Now start the ord server on port 5000:

```bash
ord --regtest server --http-port 5000
```

run this init script to prep the layers:

```bash
./scripts/init.sh
```

## Developing

We are now ready to do some dev'ing

To watch-and-build the javascript run:

```bash
yarn dev
```

and open up http://localhost:6969 in a browser

## Notes

The [metadata.json](./metadata.json) file can be modified to update the metadata the will be used.

Files can be updated in src folder and they will rebuild.

You will need to reload the browser to see the updates.

Additional content can be added to the [content](./content/) folder if needed.
