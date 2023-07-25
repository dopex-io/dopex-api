import { ethers } from 'ethers'
import { ERC20Mock__factory, SsovV3__factory } from '@dopex-io/sdk'
import axios from 'axios'

import stakingRewardsAbi from '../../constants/abis/ssovStakingRewards/stakingRewardsAbi.json'
import SsovV3OptionTokensAbi from '../../constants/abis/ssovOptionsToken/SsovOptionsToken.json'

import getPrices from '../getPrices'
import getProvider from '../getProvider'
import { TOKEN_TO_CG_ID } from '../constants'

import { SSOVS, SSOV_V3_OPTION_TOKEN_NAME } from './constants'

async function getStEthApy(duration) {
    const poolId = '747c1d2a-c668-4682-b9f9-296708a3dd90'

    const [llamaFiResponse, rewardsApy] = await Promise.all([
        axios.get('https://yields.llama.fi/pools'),
        getStakingRewardsApy(`stETH-${duration.toUpperCase()}-CALLS-SSOV-V3`),
    ])

    const pool = llamaFiResponse.data.data.find((p) => p.pool === poolId)

    console.log(pool, rewardsApy)

    return rewardsApy.map((apy) => (pool.apy + Number(apy)).toFixed(2))
}

async function getStMaticApy() {
    const poolId = 'bf3a7f07-80a0-4d5b-a311-b0f06f650f83'

    const llamaFiResponse = await axios.get('https://yields.llama.fi/pools')

    const pool = llamaFiResponse.data.data.find((p) => p.pool === poolId)

    const finalApy = pool.apy

    return [
        finalApy.toFixed(2),
        finalApy.toFixed(2),
        finalApy.toFixed(2),
        finalApy.toFixed(2),
    ]
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

            totalDeposits =
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
    // get the 2CRV Reward APY and Fees APY
    const [crvRewardAprResponse, crvFeesApyResponse, rewardApys] =
        await Promise.all([
            axios.get(
                'https://api.curve.fi/api/getFactoGaugesCrvRewards/arbitrum'
            ),
            axios.get('https://api.curve.fi/api/getSubgraphData/arbitrum'),
            getStakingRewardsApy(name),
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

    return rewardApys.map((apy) => {
        return (crvRewardApr + crvFeesApy + Number(apy)).toFixed(2)
    })
}

const getZeroApy = () => {
    return ['0', '0', '0', '0']
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
    'DPX-MONTHLY-CALLS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['DPX-MONTHLY-CALLS-SSOV-V3-3'],
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3-3': {
        fn: getStakingRewardsApy,
        args: ['rDPX-MONTHLY-CALLS-SSOV-V3-3', 3],
    },
    'stETH-WEEKLY-CALLS-SSOV-V3': {
        fn: getStEthApy,
        args: ['WEEKLY'],
    },
    'stETH-MONTHLY-CALLS-SSOV-V3': {
        fn: getStEthApy,
        args: ['MONTHLY'],
    },
    'MATIC-WEEKLY-CALLS-SSOV-V3': {
        fn: getStMaticApy,
        args: [],
    },
    'ARB-MONTHLY-CALLS-SSOV-V3': {
        fn: getStakingRewardsApy,
        args: ['ARB-MONTHLY-CALLS-SSOV-V3', 3],
    },

    // Puts
    'ETH-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['ETH-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'DPX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['DPX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['rDPX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'BTC-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['BTC-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'GMX-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['GMX-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'CRV-WEEKLY-PUTS-SSOV-V3-3': {
        fn: getSsovPutApy,
        args: ['CRV-WEEKLY-PUTS-SSOV-V3-3'],
    },
    'CVX-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['CVX-WEEKLY-PUTS-SSOV-V3'],
    },
}

const getSsovApy = async (ssov) => {
    const { symbol } = ssov

    let apy = getZeroApy()

    if (ssov.retired) return apy

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
