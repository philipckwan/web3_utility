
class Constants {
  static UNISWAP_V3_FEE = {
    MATIC_WETH: 500,
    WMATIC_WETH: 500,
    WMATIC_USDC: 500,
    WETH_WMATIC: 500,
    WETH_UNI: 3000,
    WETH_USDC: 500,
    WETH_USDT: 3000,
    WETH_WBTC: 500,
    WETH_DAI: 3000,
    WBTC_USDC: 3000,
    WBTC_WETH: 500,
    USDC_USDT: 100,
    USDC_DAI: 100,
    WETH_LINK: 3000,
    WMATIC_LINK: 500,
    WMATIC_TBAC: 500,
    USDC_PAR: 500,
    USDT_WMATIC: 500,
    SAND_WETH: 3000,
    WETH_stETH: 3000,
    YFI_USDC: 10000,
    YFI_WETH: 3000,
  };

  static DODO_LENDING_POOL = {
    WMATIC: ["0x10Dd6d8A29D489BEDE472CC1b22dc695c144c5c7"],
    USDC: ["0x5333Eb1E32522F1893B7C9feA3c263807A02d561", "0x10Dd6d8A29D489BEDE472CC1b22dc695c144c5c7"], 
    WETH:["0x5333Eb1E32522F1893B7C9feA3c263807A02d561"]
  }

  static ERC20_TOKEN = {
    MATIC: {
      symbol: "MATIC",
      name: "MATIC",
      decimals: 18,
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: ""
      }
    },
    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      addressAcrossNetworks: {
        goerli: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
        mumbai: "",
        polygon_mainnet: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
      }
    },
    USDT: {
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
      }
    },
    DAI: {
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60",
        mumbai: "",
        polygon_mainnet: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
      }
    },
    WBTC: {
      symbol: "WBTC",
      name: "Wrapped BTC",
      decimals: 8,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
      }
    },
    LINK: {
      symbol: "LINK",
      name: "ChainLink Token",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39"
      }
    },
    WMATIC: {
      symbol: "WMATIC",
      name: "Wrapped Matic",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        polygon_mainnet: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
      }
    },
    FKC: {
      symbol: "FKC",
      name: "Fu Kar Court Token",
      decimals: 12,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: ""
      }
    },
    WETH: {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        mumbai: "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
        polygon_mainnet: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
      }
    },
    UNI: {
      symbol: "UNI",
      name: "Uniswap Token",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        mumbai: "",
        polygon_mainnet: "0xb33eaad8d922b1083446dc23f610c2567fb5180f"
      }
    },
    DMA: {
      symbol: "DMA",
      name: "Dragoma",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: "0x16DFb898cf7029303c2376031392cb9baC450f94"
      }
    },
    QUICK: {
      symbol: "QUICK",
      name: "Quickswap",
      decimals: 18,
      addressAcrossNetworks: {
        goerli: "",
        mumbai: "",
        polygon_mainnet: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13"
      }
    }
  };

  static SWAP_ROUTER = {
    POLYGON_UNISWAP_V3: {
        name: "POLYGON_UNISWAP_V3",
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        protocol: 0
    },
    POLYGON_SUSHISWAP: {
        name: "POLYGON_SUSHISWAP",
        address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        protocol: 1
    },
    POLYGON_QUICKSWAP: {
        name: "POLYGON_QUICKSWAP",
        address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        protocol: 2
    },
    POLYGON_APESWAP: {
        name: "POLYGON_APESWAP",
        address: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
        protocol: 3
    },
    POLYGON_JETSWAP: {
        name: "POLYGON_JETSWAP",
        address: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
        protocol: 4
    },
    POLYGON_POLYCAT: {
        name: "POLYGON_POLYCAT",
        address: "0x94930a328162957FF1dd48900aF67B5439336cBD",
        protocol: 5
    },
    POLYGON_WAULTSWAP: {
        name: "POLYGON_WAULTSWAP",
        address: "0x3a1D87f206D12415f5b0A33E786967680AAb4f6d",
        protocol: 6
    }
  };

  static ERC20ABI = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  static UNISWAP_V3_FACTORY_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

  static UNISWAP_V3_ROUTER_02_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

  static UNISWAP_V3_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

  static UNISWAP_MUMBAI_WMATIC_WETH_POOL_ADDRESS = "0x765fDB41ea7Fd9fF26C8DD4eEa20A4248f106622";
  static UNISWAP_GOERLI_WETH_UNI_POOL_ADDRESS = "0x07A4f63f643fE39261140DF5E613b9469eccEC86";

  static WHALE_A_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  static WHALE_A_WALLET_SECRET = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

  static NETWORKS = {
    POLYGON_MAINNET: "polygon_mainnet",
    POLYGON_MUMBAI: "polygon_mumbai",
    ETHEREUM_MAINNET: "ethereum_mainnet",
    ETHEREUM_GOERLI:  "ethereum_goerli",
    FANTOM_MAINNET: "fantom_mainnet"
  }
}

exports.Constants = Constants;