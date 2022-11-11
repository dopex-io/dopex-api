import {
    ERC20__factory,
    UniswapPair__factory,
    Addresses,
    StakingRewardsV3__factory,
} from '@dopex-io/sdk'
import BN from 'bignumber.js'

import { BLOCKCHAIN_TO_CHAIN_ID } from './constants'
import getProvider from './getProvider'

const getFarmTvl = async (token, ethPriceFinal) => {
    const contractAddresses = Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']]

    const stakingRewardsAddresses = {
        'DPX-WETHStakingRewards': '0x1f80C96ca521d7247a818A09b0b15C38E3e58a28',
        'RDPX-WETHStakingRewards': '0xEb0F03A203F25F08c7aFF0e1b1C2E0EE25Ca29Eb',
    }

    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const tokenAddress = contractAddresses[token.toUpperCase()]

    const tokenContract = ERC20__factory.connect(tokenAddress, provider)

    const totalTokens = new BN((await tokenContract.totalSupply()).toString())

    const stakingAsset = token.toUpperCase() + 'StakingRewards'

    const stakingRewardsContract = StakingRewardsV3__factory.connect(
        stakingRewardsAddresses[stakingAsset],
        provider
    )

    const totalSupply = new BN(
        (await stakingRewardsContract.totalSupply()).toString()
    )

    let priceLP
    let priceDPX
    let priceRDPX

    let ethReserveOfRdpxWethPool
    let rdpxReserveOfRdpxWethPool

    let ethReserveOfDpxWethPool
    let dpxReserveOfDpxWethPool

    const dpxWethPair = UniswapPair__factory.connect(
        contractAddresses['DPX-WETH'],
        provider
    )

    const rdpxWethPair = UniswapPair__factory.connect(
        contractAddresses['RDPX-WETH'],
        provider
    )

    const [dpxWethReserve, rdpxWethReserve] = await Promise.all([
        await dpxWethPair.getReserves(),
        await rdpxWethPair.getReserves(),
    ])

    let dpxPrice = new BN(dpxWethReserve[1].toString()).dividedBy(
        dpxWethReserve[0].toString()
    )
    let rdpxPrice = new BN(rdpxWethReserve[1].toString()).dividedBy(
        rdpxWethReserve[0].toString()
    )

    // DPX and ETH from DPX-ETH pair
    ethReserveOfDpxWethPool = new BN(dpxWethReserve[1].toString())
        .dividedBy(1e18)
        .toNumber()
    dpxReserveOfDpxWethPool = new BN(dpxWethReserve[0].toString())
        .dividedBy(1e18)
        .toNumber()

    // RDPX and ETH from RDPX-ETH pair
    ethReserveOfRdpxWethPool = new BN(rdpxWethReserve[1].toString())
        .dividedBy(1e18)
        .toNumber()
    rdpxReserveOfRdpxWethPool = new BN(rdpxWethReserve[0].toString())
        .dividedBy(1e18)
        .toNumber()

    priceDPX = Number(dpxPrice) * ethPriceFinal
    priceRDPX = Number(rdpxPrice) * ethPriceFinal

    if (token === 'DPX') {
        priceLP = priceDPX
    } else if (token === 'RDPX') {
        priceLP = priceRDPX
    } else if (token === 'DPX-WETH') {
        priceLP =
            (priceDPX * Number(dpxReserveOfDpxWethPool) +
                ethPriceFinal * Number(ethReserveOfDpxWethPool)) /
            Number(totalTokens.dividedBy(1e18))
    } else {
        priceLP =
            (priceRDPX * Number(rdpxReserveOfRdpxWethPool) +
                ethPriceFinal * Number(ethReserveOfRdpxWethPool)) /
            Number(totalTokens.dividedBy(1e18))
    }

    return totalSupply.multipliedBy(priceLP).dividedBy(1e18)
}

export default getFarmTvl
