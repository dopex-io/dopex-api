import { ERC20__factory, Addresses } from '@dopex-io/sdk'
import { BigNumber } from 'bignumber.js'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'
import getProvider from './getProvider'

export default async () => {
    const arbProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)
    const ethProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)

    const tokenSaleEmitted = 75000

    const presaleAddress = '0x578d37cd3b2a69f36a62b287b5262b056d9b1119'
    const presaleAllocation = 44940

    const teamVestingAddress = '0x38569f73190d6d2f3927c0551526451e3af4d8d6'
    const teamVestingAllocation = 60000

    const teamVestingV2Address = '0x3757b49d79063e157dc376f2b409c3730fa17f61'
    const teamVestingV2Allocation = 1750

    const dpxEth = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ETHEREUM']].DPX,
        ethProvider
    )

    const dpxArb = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].DPX,
        arbProvider
    )

    // Async call of all promises
    const [presaleBalance, teamVestingBalance, teamVestingV2Balance] =
        await Promise.all([
            dpxEth.balanceOf(presaleAddress),
            dpxEth.balanceOf(teamVestingAddress),
            dpxArb.balanceOf(teamVestingV2Address),
        ])

    const presaleEmitted =
        presaleAllocation -
        new BigNumber(presaleBalance.toString()).dividedBy(1e18).toNumber()

    const teamVestingEmitted =
        teamVestingAllocation -
        new BigNumber(teamVestingBalance.toString()).dividedBy(1e18).toNumber()

    const teamVestingV2Emitted =
        teamVestingV2Allocation -
        new BigNumber(teamVestingV2Balance.toString())
            .dividedBy(1e18)
            .toNumber()

    // Farming (Total Rewards - Current Rewards)
    // TODO: MAKE DYNAMIC
    const farmsEmitted = 40000

    // Operational allocation
    const operationalAllocationEmitted = 1714.7

    const ssovRewardsEmitted = 1992.5

    const circulatingSupply =
        presaleEmitted +
        tokenSaleEmitted +
        teamVestingEmitted +
        farmsEmitted +
        teamVestingV2Emitted +
        ssovRewardsEmitted +
        operationalAllocationEmitted

    return circulatingSupply
}
