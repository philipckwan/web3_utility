const {aNum, aNum2, Car} = require("./test1");
const {getTokenStructs} = require("./constantsToken");
//import {aNum, aNum2} from ("./test1.js");

console.log(`test2: 1.0;`);

console.log(`_aNum:${aNum};`);

console.log(`_aNum2:${aNum2};`);

let aCar = new Car('pck', 1980);
console.log(`aCar: name:${aCar.name}; year:${aCar.year};`)

let tokenStructs = getTokenStructs("polygon_mainnet2");

for (let aTokenStruct of tokenStructs) {
    console.log(aTokenStruct);
}
