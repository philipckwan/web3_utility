const {lookupUniswapV3PoolFee} = require('../src/helpers');
const {ERC20_TOKEN} = require('../src/constants')

numPassed = 0;
numFailed = 0;

function testMatchFee(testcase, token1, token2, expectedFee) {
    let actualFee = lookupUniswapV3PoolFee(token1, token2);
    if (expectedFee == actualFee) {
        console.log(`testUniswapV3Fee.testMatchFee: testcase[${testcase}] - PASSED!`);
        numPassed++;
    } else {
        console.log(`testUniswapV3Fee.testMatchFee: testcase[${testcase}] - FAILED! expectedFee:${expectedFee}; actualFee:${actualFee};`);
        numFailed++;
    }
}

function runTests() {
    console.log(`testUniswapV3Fee.runTests: 1.0;`);
    
    let usdc = ERC20_TOKEN["USDC"];
    let wbtc = ERC20_TOKEN["WBTC"];
    let weth = ERC20_TOKEN["WETH"];
    let wmatic = ERC20_TOKEN["WMATIC"];
    let link = ERC20_TOKEN["LINK"];
    let uni = ERC20_TOKEN["UNI"];
    let fkc = ERC20_TOKEN["FKC"];
    let matic = ERC20_TOKEN["MATIC"];

    const DEFAULT_FEE = 9999;

    testMatchFee(1, usdc, wmatic, 500);
    testMatchFee(2, wmatic, usdc, 500);
    testMatchFee(3, usdc, wbtc, 3000);
    testMatchFee(4, weth, uni, 3000);
    testMatchFee(5, link, weth, DEFAULT_FEE);
    testMatchFee(6, wmatic, link, DEFAULT_FEE);
    testMatchFee(7, weth, wbtc, 500);
    testMatchFee(8, fkc, matic, DEFAULT_FEE);
    
    console.log(`testUniswapV3Fee.runTests: 9.0; numPassed:${numPassed}; numFailed:${numFailed};`)
}

runTests();