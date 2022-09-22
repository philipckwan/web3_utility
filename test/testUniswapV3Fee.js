//const {lookupUniswapV3PoolFeeBySymbol} = require('../src/helpers');
//const {ERC20_TOKEN} = require('../src/constants')
const {ConstantsToken} = require('../src/constants/ConstantsToken');
const {Context} = require('../src/utils/Context');
const {UniswapV3Commons} = require('../src/utils/UniswapV3Commons')

numPassed = 0;
numFailed = 0;

function testMatchFee(testcase, token1, token2, expectedFee) {
    let actualFee = UniswapV3Commons.lookupUniswapV3PoolFeeBySymbol(token1[1], token2[1]);
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
    Context.init("PM", "local");
    
    let usdc = ConstantsToken.findOneToken("USDC");
    let wbtc = ConstantsToken.findOneToken("WBTC");
    let weth = ConstantsToken.findOneToken("WETH");
    let wmatic = ConstantsToken.findOneToken("WMATIC");
    let link = ConstantsToken.findOneToken("LINK");
    let uni = ConstantsToken.findOneToken("UNI");
    let fkc = ConstantsToken.findOneToken("FKC");
    let matic = ConstantsToken.findOneToken("MATIC");

    const DEFAULT_FEE = 9999;

    testMatchFee(1, usdc, wmatic, 500);
    testMatchFee(2, wmatic, usdc, 500);
    testMatchFee(3, usdc, wbtc, 3000);
    testMatchFee(4, weth, uni, 3000);
    testMatchFee(5, link, weth, 3000);
    testMatchFee(6, wmatic, link, 500);
    testMatchFee(7, weth, wbtc, 500);
    //testMatchFee(8, fkc, matic, DEFAULT_FEE);
    
    console.log(`testUniswapV3Fee.runTests: 9.0; numPassed:${numPassed}; numFailed:${numFailed};`)
}

runTests();