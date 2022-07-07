import { ERC20__factory, Addresses } from '@dopex-io/sdk'
import { BigNumber } from 'bignumber.js'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'
import getProvider from './getProvider'

export default async () => {
    const ethProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)

    const tokenSaleEmitted = 60000

    const rdpxEth = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ETHEREUM']].RDPX,
        ethProvider
    )

    const rdpxMerkleDistributorBalance = await rdpxEth.balanceOf(
        '0x20E3D49241A9658C36Df595437160a6F6Dc01bDe'
    )

    // Farming (Total Rewards - Current Rewards)
    // TODO: MAKE DYNAMIC
    const farmsEmitted = 1040000

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
        farmsEmitted +
        sideEmitted +
        airdropEmitted +
        rdpxSsovEmitted +
        rdpxFarm2Emitted

    return circulatingSupply
}
