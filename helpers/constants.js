import { BigNumber } from 'ethers'

export const TOKEN_TO_CG_ID = {
    DPX: 'dopex',
    RDPX: 'dopex-rebate-token',
    GOHM: 'governance-ohm',
    ETH: 'ethereum',
    GMX: 'gmx',
    BNB: 'binancecoin',
    AVAX: 'avalanche-2',
    METIS: 'metis',
    CRV: 'curve-dao-token',
}

export const BLOCKCHAIN_TO_CHAIN_ID = {
    ETHEREUM: 1,
    GOERLI: 5,
    ARBITRUM: 42161,
    ARB_GOERLI: 421613,
    BSC: 56,
    AVAX: 43114,
    METIS: 1088,
    POLYGON: 137,
}

export const DECIMALS_USD = BigNumber.from(10).pow(6)
export const DECIMALS_TOKEN = BigNumber.from(10).pow(18)
export const DECIMALS_STRIKE = BigNumber.from(10).pow(8)
