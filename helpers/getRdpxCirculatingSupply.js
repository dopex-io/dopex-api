import {
    ERC20__factory,
    Addresses,
    StakingRewards__factory,
} from '@dopex-io/sdk'
import { BigNumber } from 'bignumber.js'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'
import getProvider from './getProvider'

export default async () => {
    const arbProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ethProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)

    const tokenSaleEmitted = 60000

    const rdpxArb = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].RDPX,
        arbProvider
    )

    const rdpxEth = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ETHEREUM']].RDPX,
        ethProvider
    )

    const rdpxStakingRewards = StakingRewards__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].RDPXStakingRewards,
        arbProvider
    )

    // Async call of all promises
    const [
        dpxFarmBalance,
        dpxWethFarmBalance,
        rdpxWethFarmBalance,
        rdpxFarmTotalSupply,
        rdpxFarmBalance,
        rdpxMerkleDistributorBalance,
    ] = await Promise.all([
        rdpxArb.balanceOf(
            Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].DPXStakingRewards
        ),
        rdpxArb.balanceOf(
            Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']][
                'DPX-WETHStakingRewards'
            ]
        ),
        rdpxArb.balanceOf(
            Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']][
                'RDPX-WETHStakingRewards'
            ]
        ),
        rdpxStakingRewards.totalSupply(),
        rdpxArb.balanceOf(
            Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']]['RDPXStakingRewards']
        ),
        rdpxEth.balanceOf('0x20E3D49241A9658C36Df595437160a6F6Dc01bDe'),
    ])

    // Farming (Total Rewards - Current Rewards)
    const dpxFarmEmitted =
        400000 -
        new BigNumber(dpxFarmBalance.toString()).dividedBy(1e18).toNumber()
    const dpxWethFarmEmitted =
        800000 -
        new BigNumber(dpxWethFarmBalance.toString()).dividedBy(1e18).toNumber()
    const rdpxWethFarmEmitted =
        800000 -
        new BigNumber(rdpxWethFarmBalance.toString()).dividedBy(1e18).toNumber()
    const rdpxFarmEmitted =
        40000 -
        new BigNumber(rdpxFarmBalance.toString())
            .minus(rdpxFarmTotalSupply.toString())
            .dividedBy(1e18)
            .toNumber()

    // For bootstrapping liquidity
    const sideEmitted = 21200

    const airdropEmitted =
        83920 -
        new BigNumber(rdpxMerkleDistributorBalance.toString())
            .dividedBy(1e18)
            .toNumber()

    const rdpxFarm2Emitted = 8000

    // For the April 2022 epoch
    const rdpxSsovEmitted = 1200

    const circulatingSupply =
        tokenSaleEmitted +
        dpxFarmEmitted +
        dpxWethFarmEmitted +
        rdpxWethFarmEmitted +
        rdpxFarmEmitted +
        sideEmitted +
        airdropEmitted +
        rdpxSsovEmitted +
        rdpxFarm2Emitted

    return circulatingSupply
}
