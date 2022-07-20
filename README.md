# web3_utility

This is a nodeJS tool to help interact with ethereum based (i.e. ethereum, polygon) blockchain, using ethersjs.

In order to setup to use, you should first copy .env.example to become .env, and update the settings inside for fields such as:<br />
-your wallet address and secret (you may skip to update the secret if you only usig this tool for read-only operations such as checking balances and prices of ERC20 tokens)<br />
-API url with keys for some of the mainnet and testnet that you want to interact with, for example, etherum goerli, polygon mumbai, polygon mainnet<br />
-API url for local is setup for you if you have setup local node or tunnel to a node (i.e. ssh tunnel to a machine that is running a node)

Then, to install all the npm packages:
> npm install

Then, to run this tool:
> node src/[js file]

Some examples:
> node src/getBalance.js me<br />

This will get the native balance of the wallet address specified in .env

> node src/getBalance.js me usdc usdt<br />

This will get, in addition to the above, the USDC and USDT (ERC20) tokens balances

> node src/getBalance.js<br />

If no argument is given, the tool will output the usage information

> node src/quoter.js -a10000 -sUQS usdc wmatic<br />

This will get the swap amount of swapping 10000 USDC to WMATIC, it will check the prices across 3 DEXs: uniswapV3, quickswap, sushiswap

> node src/arbCheck.js -a10000 -sUQS usdc weth usdc<br />

This will check the arbitrage opportunity of swapping first 10000 USDC to WMATIC, then from WMATIC back to USDC, across the same 3 DEXs as above.
If the final result is more than 10000, then that means there existed an arbitrage opportunity

> node src/flashloan.js<br />

This is a tool specific to call a flashloan arbitrage contract that I have created. It does not work completely by itself, the flashloan contract is out of scope of this tool.

There are more tools located in the src/ directory, feel free to explore.


