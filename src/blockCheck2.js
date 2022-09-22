const {init, formatTime, getProvider} = require('./helpers');

init();

/*
 this is a block number checker based on notification, using web3Provider.on("block"...)
 but seems the performance is not as good as directly using web3Provider.getBlockNumber(), i.e. it is slower
 so, I will just leave it as is for now
*/
async function main() {
    console.log(`blockCheck2.main: v0.9;`);

    if (process.argv.length == 3 && process.argv[2] == "-once") {
        // TODO
        return;
    }

    const provider = getProvider();
    provider.on("block", async (blockNumber) => {
        let endTime = Date.now();
        console.log(`blockCheck.main: blockNumber: [${blockNumber}]; T:[${formatTime(endTime)}];`);
        const block = await provider.getBlock(blockNumber);
        console.log(`__block:${JSON.stringify(block)};`);
    });
}

main();