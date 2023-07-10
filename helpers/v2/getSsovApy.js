import { ethers } from 'ethers'
import { BigNumber } from 'ethers'
import { Addresses, ERC20Mock__factory, SsovV3__factory } from '@dopex-io/sdk'
import { zipWith } from 'lodash'
import axios from 'axios'

import stakingRewardsAbi from '../../constants/abis/ssovStakingRewards/stakingRewardsAbi.json'
import SsovV3OptionTokensAbi from '../../constants/abis/ssovOptionsToken/SsovOptionsToken.json'

import getPrices from '../getPrices'
import getProvider from '../getProvider'
import { BLOCKCHAIN_TO_CHAIN_ID, TOKEN_TO_CG_ID } from '../constants'

import { SSOVS, SSOV_V3_OPTION_TOKEN_NAME } from './constants'

import fetchEpochRewards from './ssov/fetchEpochRewards'

const SSOV_VERSION = 'SSOV-V3'
const BIG_NUMBER_ETHERS = BigNumber.from(10).pow(18)
const DAYS_PER_YEAR = 365
const SECONDS_PER_DAY = 60 * 60 * 24

const TOKEN_ADDRESS_TO_CG_ID = {
    '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55': 'dopex',
    '0x32eb7902d4134bf98a28b963d26de779af92a212': 'dopex-rebate-token',
    '0x10393c20975cf177a3513071bc110f7962cd67da': 'jones-dao',
    '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60': 'lido-dao',
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270': 'matic-network',
    '0x912ce59144191c1204e64559fe8253a0e49e6548': 'arbitrum',
}

async function fetchTotalCollateralBalance(ssovContract, epoch) {
    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]
    return totalEpochDeposits.div(BIG_NUMBER_ETHERS).toNumber()
}

function calculateApy(rewardsPerYear, totalEpochDeposits) {
    const denominator = totalEpochDeposits + rewardsPerYear
    const apr = (denominator / totalEpochDeposits - 1) * 100
    return ((1 + apr / DAYS_PER_YEAR / 100) ** DAYS_PER_YEAR - 1) * 100
}

async function getStEthApy(duration) {
    const poolId = '747c1d2a-c668-4682-b9f9-296708a3dd90'

    const [llamaFiResponse, rewardsApy] = await Promise.all([
        axios.get('https://yields.llama.fi/pools'),
        getRewardsApy(`stETH-${duration.toUpperCase()}-CALLS-SSOV-V3`, false),
    ])

    const pool = llamaFiResponse.data.data.find((p) => p.pool === poolId)

    const finalApy = pool.apy + Number(rewardsApy)

    return finalApy.toFixed(2)
}

async function getGohmApy() {
    const mainnetProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)

    const stakingContract = new ethers.Contract(
        '0xB63cac384247597756545b500253ff8E607a8020',
        [
            'function epoch() view returns (uint256 length, uint256 number, uint256 end, uint256 distribute)',
        ],
        mainnetProvider
    )
    const sohmMainContract = new ethers.Contract(
        '0x04906695D6D12CF5459975d7C3C03356E4Ccd460',
        ['function circulatingSupply() view returns (uint256)'],
        mainnetProvider
    )

    const [epoch, circulatingSupply] = await Promise.all([
        stakingContract.epoch(),
        sohmMainContract.circulatingSupply(),
    ])

    const stakingRebase =
        Number(epoch.distribute.toString()) /
        Number(circulatingSupply.toString())

    return ((Math.pow(1 + stakingRebase, 365 * 3) - 1) * 100).toFixed(2)
}

async function getRewardsApy(name, version = 1) {
    const ssov = SSOVS.find((s) => s.symbol === name)

    const provider = getProvider(ssov.chainId)

    const ssovContract = SsovV3__factory.connect(
        Addresses[ssov.chainId][SSOV_VERSION].VAULTS[name],
        provider
    )

    const [epoch, _underlyingPrice] = await Promise.all([
        ssovContract.currentEpoch(),
        ssovContract.getUnderlyingPrice(),
    ])

    if (epoch.isZero()) return '0'

    const [epochTimes, totalEpochDeposits, { rewards, rewardTokens }] =
        await Promise.all([
            ssovContract.getEpochTimes(epoch),
            fetchTotalCollateralBalance(ssovContract, epoch),
            fetchEpochRewards(ssovContract, epoch, provider, version),
        ])

    const [startTime, expiry] = epochTimes
    const totalPeriod = expiry.toNumber() - startTime.toNumber()

    // get price of underlying ssov token
    const underlyingPrice = Number(
        ethers.utils.formatUnits(_underlyingPrice, 8)
    )

    const totalEpochDepositsInUsd = totalEpochDeposits * underlyingPrice

    const addressToId = rewardTokens.map((rewardToken) => {
        return TOKEN_ADDRESS_TO_CG_ID[rewardToken.toLowerCase()]
    })

    const rewardTokenPrices = await getPrices(addressToId)

    let totalRewardsInUsd = 0
    zipWith(rewards, rewardTokenPrices, function (reward, rewardTokenPrice) {
        const rewardsInUsd =
            rewardTokenPrice * reward.div(BIG_NUMBER_ETHERS).toNumber()
        totalRewardsInUsd += rewardsInUsd
    })

    const rewardsPerYear =
        (totalRewardsInUsd / totalPeriod) * (SECONDS_PER_DAY * DAYS_PER_YEAR)

    return calculateApy(rewardsPerYear, totalEpochDepositsInUsd).toFixed(2)
}

async function getStakingRewardsApy(name) {
    const ssov = SSOVS.find((s) => s.symbol === name)
    const provider = getProvider(ssov.chainId)

    const stakingContract = new ethers.Contract(
        '0x9d5FA385cd988d3F148F53a9A5C87B7C8540B62d',
        stakingRewardsAbi,
        provider
    )

    const ssovContract = SsovV3__factory.connect(ssov.address, provider)

    const currentEpoch = await ssovContract.currentEpoch()

    const [epochData, collateralPrice] = await Promise.all([
        ssovContract.getEpochData(currentEpoch),
        ssovContract.getCollateralPrice(),
    ])

    const collateralPriceUsd = ethers.utils.formatUnits(collateralPrice, 8)

    const { strikes, expiry, startTime } = epochData
    const interval = Math.floor(
        365 / Math.ceil(expiry.sub(startTime).toNumber() / 86400)
    )

    const stakingRewardsInfoCalls = []
    const strikeDataCalls = []

    for (const strike of strikes) {
        strikeDataCalls.push(
            ssovContract.getEpochStrikeData(currentEpoch, strike)
        )

        stakingRewardsInfoCalls.push(
            stakingContract[
                'getSsovEpochStrikeRewardsInfo(address,uint256,uint256)'
            ](ssovContract.address, strike, currentEpoch)
        )
    }

    const stakingRewardsInfo = await Promise.all(stakingRewardsInfoCalls)

    let apys = []

    for (const [index] of strikes.entries()) {
        const rewardsInfo = stakingRewardsInfo[index]

        let totalUsdValue = 0
        // default as 1 to avoid division by zero
        let totalDeposits = 1

        for (const rewardInfo of rewardsInfo) {
            const rewardToken = ERC20Mock__factory.connect(
                rewardInfo.rewardToken,
                provider
            )

            // Fetching name and symbol, for option tokens should return the option name
            const [name, symbol] = await Promise.all([
                rewardToken.name(),
                rewardToken.symbol(),
            ])

            const amount = Number(
                ethers.utils.formatUnits(rewardInfo.rewardAmount, 18)
            )

            let _rewardsUsdValue = 0
            // If reward token is option token
            if (name === SSOV_V3_OPTION_TOKEN_NAME) {
                const optionsContract = new ethers.Contract(
                    rewardInfo.rewardToken,
                    SsovV3OptionTokensAbi,
                    provider
                )

                // Option value == premium of the option
                let [underlyingSymbol, strike] = await Promise.all([
                    optionsContract.underlyingSymbol(),
                    optionsContract.strike(),
                ])

                const usdPrice = await getPrices([
                    TOKEN_TO_CG_ID[underlyingSymbol],
                ])

                let optionValue = Number(usdPrice) - Number(strike.div(1e8))
                optionValue = optionValue < 0 ? 0 : optionValue

                _rewardsUsdValue = optionValue * amount
            } else {
                const usdPrice = await getPrices([TOKEN_TO_CG_ID[symbol]])

                _rewardsUsdValue = Number(usdPrice) * amount
            }

            totalDeposits +=
                Number(ethers.utils.formatUnits(rewardInfo.totalSupply, 18)) *
                Number(collateralPriceUsd)
            totalUsdValue += _rewardsUsdValue
        }

        const apy =
            totalUsdValue === 0
                ? 0
                : ((totalUsdValue * interval) / totalDeposits) * 100

        apys.push(apy.toFixed(2))
    }

    return apys
}

async function getSsovPutApy(name) {
    const ssov = SSOVS.find((s) => s.symbol === name)

    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(ssov.address, provider)

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'
    const [startTime, expiry] = await ssovContract.getEpochTimes(epoch)
    const totalPeriod = expiry.toNumber() - startTime.toNumber()

    const twoCrvPrice =
        (await ssovContract.getCollateralPrice()).toNumber() / 10 ** 8
    const totalEpochDeposits = await fetchTotalCollateralBalance(
        ssovContract,
        epoch
    )
    const totalEpochDepositsInUsd = totalEpochDeposits * twoCrvPrice

    // get CRV and DPX prices
    const [dpxPrice] = await getPrices([TOKEN_TO_CG_ID.DPX])

    // calculate DPX incentives
    const { rewards: dpxRewards } = await fetchEpochRewards(
        ssovContract,
        epoch,
        provider
    )
    const dpxRewardsInUsd =
        dpxRewards[0].div(BIG_NUMBER_ETHERS).toNumber() * dpxPrice
    const dpxRewardsInUsdPerYear =
        (dpxRewardsInUsd / totalPeriod) * (SECONDS_PER_DAY * DAYS_PER_YEAR)

    // get the 2CRV Reward APY and Fees APY
    const [crvRewardAprResponse, crvFeesApyResponse] = await Promise.all([
        axios.get('https://api.curve.fi/api/getFactoGaugesCrvRewards/arbitrum'),
        axios.get('https://api.curve.fi/api/getSubgraphData/arbitrum'),
    ])

    const crvRewardApr =
        crvRewardAprResponse.data.data.sideChainGaugesApys.find(
            (item) =>
                item.address.toLowerCase() ===
                '0x7f90122bf0700f9e7e1f688fe926940e8839f353'
        ).apy

    const crvFeesApy = crvFeesApyResponse.data.data.poolList.find(
        (item) =>
            item.address.toLowerCase() ===
            '0x7f90122bf0700f9e7e1f688fe926940e8839f353'
    ).latestDailyApy

    return (
        calculateApy(dpxRewardsInUsdPerYear, totalEpochDepositsInUsd) +
        crvRewardApr +
        crvFeesApy
    ).toFixed(2)
}

const getZeroApy = () => {
    return '0'
}

const NAME_TO_GETTER = {
    // Calls
    'DPX-WEEKLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['DPX-WEEKLY-CALLS-SSOV-V3', 2],
    },
    'rDPX-WEEKLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['rDPX-WEEKLY-CALLS-SSOV-V3', 3],
    },
    'gOHM-WEEKLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['gOHM-WEEKLY-CALLS-SSOV-V3'],
    },
    'ETH-MONTHLY-CALLS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['ETH-MONTHLY-CALLS-SSOV-V3-3'],
    },
    'DPX-MONTHLY-CALLS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['DPX-MONTHLY-CALLS-SSOV-V3-3'],
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['rDPX-MONTHLY-CALLS-SSOV-V3-3', 3],
    },
    'stETH-WEEKLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['stETH-WEEKLY-CALLS-SSOV-V3'],
    },
    'stETH-MONTHLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['stETH-MONTHLY-CALLS-SSOV-V3'],
    },
    'MATIC-WEEKLY-CALLS-SSOV-V3': {
        fn: getRewardsApy,
        args: ['MATIC-WEEKLY-CALLS-SSOV-V3', 3],
    },
    'ARB-MONTHLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['ARB-MONTHLY-CALLS-SSOV-V3', 3],
    },

    // Puts
    'ETH-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['ETH-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'DPX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['DPX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['rDPX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'BTC-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['BTC-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'gOHM-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['gOHM-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'GMX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['GMX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'CRV-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['CRV-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'ETH-QUARTERLY-PUTS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['ETH-QUARTERLY-PUTS-SSOV-V3'],
    },
    'CVX-WEEKLY-PUTS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['CVX-WEEKLY-PUTS-SSOV-V3'],
    },
}

const getSsovApy = async (ssov) => {
    const { symbol } = ssov

    if (ssov.retired) return getZeroApy()

    let apy = getZeroApy()

    try {
        if (NAME_TO_GETTER[symbol])
            apy = await NAME_TO_GETTER[symbol].fn(
                ...NAME_TO_GETTER[symbol].args
            )
    } catch (err) {
        console.log(err)
    }
    return apy
}

export default getSsovApy
