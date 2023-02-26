import {
    UniswapPair__factory,
    Addresses,
    StakingRewardsV3__factory,
} from '@dopex-io/sdk'
import getFarmTvl from '../getFarmTvl'
import BN from 'bignumber.js'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../constants'
import getProvider from '../getProvider'

const getFarmApy = async (token, ethPriceFinal) => {
    const contractAddresses = Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']]

    const stakingRewardsAddresses = {
        'DPX-WETHStakingRewards': '0x1f80C96ca521d7247a818A09b0b15C38E3e58a28',
        'RDPX-WETHStakingRewards': '0xEb0F03A203F25F08c7aFF0e1b1C2E0EE25Ca29Eb',
    }

    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const stakingAsset = token.toUpperCase() + 'StakingRewards'

    const stakingRewardsContract = StakingRewardsV3__factory.connect(
        stakingRewardsAddresses[stakingAsset],
        provider
    )

    const tvl = await getFarmTvl(token, ethPriceFinal)

    const rewardRate = await stakingRewardsContract.rewardRate()

    let priceDPX

    const dpxWethPair = UniswapPair__factory.connect(
        contractAddresses['DPX-WETH'],
        provider
    )

    const dpxWethReserve = await await dpxWethPair.getReserves()

    let dpxPrice = new BN(dpxWethReserve[1].toString()).dividedBy(
        dpxWethReserve[0].toString()
    )

    priceDPX = Number(dpxPrice) * ethPriceFinal

    const totalRewardsPerYear = new BN(rewardRate.toString())
        .multipliedBy(86400 * 365 * priceDPX)
        .dividedBy(1e18)

    return ((Number(totalRewardsPerYear) + Number(tvl)) / Number(tvl) - 1) * 100
}

export default getFarmApy
