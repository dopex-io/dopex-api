import { Addresses, SsovV3__factory } from '@dopex-io/sdk'
import zipWith from 'lodash/zipWith'

import getProvider from '../getProvider'

import _fetchEpochRewards from './ssov/fetchEpochRewards'
import { SSOVS } from './constants'

const SSOV_VERSION = 'SSOV-V3'
const TWO_CRV_ADDRESS = '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978'

const TOKEN_ADDRESS_TO_NAME = {
    '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55': 'DPX',
    '0x32eb7902d4134bf98a28b963d26de779af92a212': 'rDPX',
    '0x10393c20975cf177a3513071bc110f7962cd67da': 'JONES',
    '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60': 'LDO',
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': 'WMATIC',
    TWO_CRV_ADDRESS: '2CRV',
}

async function fetchEpochRewards(name, version, isCurveStrat) {
    const ssov = SSOVS.find((s) => s.symbol === name)

    const provider = getProvider(ssov.chainId)

    const ssovContract = SsovV3__factory.connect(
        Addresses[ssov.chainId][SSOV_VERSION].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    let { rewards, rewardTokens } = await _fetchEpochRewards(
        ssovContract,
        epoch,
        provider,
        version
    )

    if (isCurveStrat) {
        rewardTokens = rewardTokens.filter(
            (token) => token.toLowerCase() !== TWO_CRV_ADDRESS
        )
    }

    return zipWith(rewards, rewardTokens, function (reward, token) {
        return {
            amount: reward.toString(),
            rewardToken: TOKEN_ADDRESS_TO_NAME[token.toLowerCase()],
        }
    })
}

const NAME_TO_GETTER = {
    'DPX-WEEKLY-CALLS-SSOV-V3': {
        version: 2,
        isCurveStrat: false,
    },
    'rDPX-WEEKLY-CALLS-SSOV-V3': {
        version: 3,
        isCurveStrat: false,
    },
    'ETH-MONTHLY-CALLS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: false,
    },
    'DPX-MONTHLY-CALLS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: false,
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3-3': {
        version: 3,
        isCurveStrat: false,
    },
    'stETH-WEEKLY-CALLS-SSOV-V3': {
        version: 1,
        isCurveStrat: false,
    },
    'stETH-MONTHLY-CALLS-SSOV-V3': {
        version: 1,
        isCurveStrat: false,
    },
    'MATIC-WEEKLY-CALLS-SSOV-V3': {
        version: 3,
        isCurveStrat: false,
    },

    // Puts
    'ETH-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'DPX-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'BTC-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'gOHM-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'GMX-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'CRV-WEEKLY-PUTS-SSOV-V3-3': {
        version: 1,
        isCurveStrat: true,
    },
    'ETH-QUARTERLY-PUTS-SSOV-V3': {
        version: 1,
        isCurveStrat: true,
    },
}

const getSsovRewards = async (ssov) => {
    const { symbol } = ssov

    if (ssov.retired) return []

    let rewards = []

    try {
        if (NAME_TO_GETTER[symbol])
            return await fetchEpochRewards(
                symbol,
                NAME_TO_GETTER[symbol].version,
                NAME_TO_GETTER[symbol].isCurveStrat
            )
    } catch (err) {
        console.log(err)
    }
    return rewards
}

export default getSsovRewards
