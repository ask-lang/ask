# Ask!

[![ga-svg]][ga-url]
[![line-svg]][line-url]

[ga-svg]: https://github.com/ask-lang/ask/workflows/CI/badge.svg
[ga-url]: https://github.com/ask-lang/ask/actions
[line-svg]: https://tokei.rs/b1/github/ask-lang/ask
[line-url]: https://github.com/ask-lang/ask

**Ask!** is a framework for AssemblyScript developers to write WASM smart contracts on [Substrate](https://github.com/paritytech/substrate) FRAME [pallet-contracts](https://github.com/paritytech/substrate/tree/master/frame/contracts).

## Usage

### Quick Start

There is a simple [template](https://github.com/ask-lang/ask-template) for creating an Ask! contract project.

```bash
git clone https://github.com/ask-lang/ask-template.git
cd ask-template

# Instale dependencies and Build the template contract
yarn && yarn build flipper.ts
```

The above command will generate wasm code and metadata file of the contract.
After that you need to deploy them to the substrate-based blockchain containing the [pallet-contracts](https://github.com/paritytech/substrate/tree/master/frame/contracts), like:

- [substrate-contracts-node](https://github.com/paritytech/substrate-contracts-node)
- [Contracts on Rococo](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frococo-contracts-rpc.polkadot.io#/contracts)
- Others

You can refer to the [deployment section](https://ask-lang.github.io/ask-docs/getting-started/deploy-your-contract) in our [documentation](https://ask-lang.github.io/ask-docs/).

### Examples

You can run the following simple command to try some examples:

```bash
cd ask

yarn && yarn build
yarn example examples/flipper/index.ts
```

Here is a list of examples:

- [flipper](https://github.com/ask-lang/ask/tree/main/examples/flipper)
- [inherent-flipper](https://github.com/ask-lang/ask/tree/main/examples/inherent-flipper)
- [erc20](https://github.com/ask-lang/ask/tree/main/examples/erc20)
- [crypto](https://github.com/ask-lang/ask/tree/main/examples/crypto)
- [lazy](https://github.com/ask-lang/ask/tree/main/examples/lazy)
- [mapping](https://github.com/ask-lang/ask/tree/main/examples/mapping)
- [vector](https://github.com/ask-lang/ask/tree/main/examples/vector)
- ...

Feel free to open a PR to add your interesting ones into the list.

## License

Ask! is licensed under [MIT](LICENSE).
