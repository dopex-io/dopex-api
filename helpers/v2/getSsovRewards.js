import { ethers, BigNumber } from 'ethers'
import { Addresses, SsovV3__factory } from '@dopex-io/sdk'
import zipWith from 'lodash/zipWith'

import getProvider from '../getProvider'
import { BLOCKCHAIN_TO_CHAIN_ID } from '../constants'

const SSOV_VERSION = 'SSOV-V3'
const TWO_CRV_ADDRESS = '0x11cdb42b0eb46d95f990bedd4695a6e3fa034978'

const TOKEN_ADDRESS_TO_NAME = {
    '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55': 'DPX',
    '0x32eb7902d4134bf98a28b963d26de779af92a212': 'rDPX',
    '0x10393c20975cf177a3513071bc110f7962cd67da': 'JONES',
    '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60': 'LDO',
    TWO_CRV_ADDRESS: '2CRV',
}

async function fetchEpochRewards(name, isV2Staking, isCurveStrat) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161][SSOV_VERSION].VAULTS[name],
        provider
    )

    const stakingContractAddr = (await ssovContract.addresses()).stakingStrategy
    const epoch = await ssovContract.currentEpoch()

    let abis

    if (isV2Staking) {
        abis = [
            'function rewardsPerEpoch(uint256,uint256) view returns (uint256)',
            'function getRewardTokens() view returns (address[])',
        ]
    } else {
        abis = [
            'function rewardsPerEpoch(uint256) view returns (uint256)',
            'function getRewardTokens() view returns (address[])',
        ]
    }

    const stakingContract = new ethers.Contract(
        stakingContractAddr,
        abis,
        provider
    )

    let rewardTokens
    rewardTokens = await stakingContract.getRewardTokens()

    let rewards = []
    if (isV2Staking) {
        const rewardsPromises = []
        rewardTokens.map(async (_, idx) => {
            rewardsPromises.push(
                stakingContract.rewardsPerEpoch(epoch, BigNumber.from(idx))
            )
        })
        rewards = await Promise.all(rewardsPromises)
    } else {
        rewards = [await stakingContract.rewardsPerEpoch(epoch)]
    }

    if (isCurveStrat) {
        rewardTokens = rewardTokens.filter(
            (token) => token.toLowerCase() !== TWO_CRV_ADDRESS
        )
    }

    return zipWith(rewards, rewardTokens, function (reward, token) {
        return {
            amount: reward,
            rewardToken: TOKEN_ADDRESS_TO_NAME[token.toLowerCase()],
        }
    })
}

const NAME_TO_GETTER = {
    // Calls
    'ETH-WEEKLY-CALLS-SSOV-V3-5': {
        isV2: false,
        isCurveStrat: false,
    },
    'DPX-WEEKLY-CALLS-SSOV-V3': {
        isV2: true,
        isCurveStrat: false,
    },
    'rDPX-WEEKLY-CALLS-SSOV-V3': {
        isV2: true,
        isCurveStrat: false,
    },
    'ETH-MONTHLY-CALLS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: false,
    },
    'DPX-MONTHLY-CALLS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: false,
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: false,
    },
    'stETH-WEEKLY-CALLS-SSOV-V3': {
        isV2: false,
        isCurveStrat: false,
    },

    // Puts
    'ETH-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'DPX-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'BTC-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'gOHM-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'GMX-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'CRV-WEEKLY-PUTS-SSOV-V3-3': {
        isV2: false,
        isCurveStrat: true,
    },
    'ETH-QUARTERLY-PUTS-SSOV-V3': {
        isV2: false,
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
                NAME_TO_GETTER[symbol].isV2,
                NAME_TO_GETTER[symbol].isCurveStrat
            )
    } catch (err) {
        console.log(err)
    }
    return rewards
}

export default getSsovRewards
