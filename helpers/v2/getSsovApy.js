import { ethers } from 'ethers'
import BN from 'bignumber.js'
import {
    Addresses,
    ERC20SSOV__factory,
    StakingRewards__factory,
    SsovV3__factory,
} from '@dopex-io/sdk'

import getPrices from '../getPrices'
import getProvider from '../getProvider'
import { BLOCKCHAIN_TO_CHAIN_ID } from '../constants'

const SSOV_VERSION = 'SSOV-V3-2'

async function getRewardsFromStakingStrat(ssovContract) {
    const stakingStratAddr = (await ssovContract.addresses())['stakingStrategy'].address

    console.log(stakingStratAddr)

    const stakingContract = new ethers.Contract(
        stakingStratAddr,
        [
            'function rewardsPerEpoch() view returns (uint256)',
        ],
        provider
    )

    const [rewards] = await Promise.all([
        stakingContract.rewardsPerEpoch(epoch)
    ])

    return rewards;
}

async function getTotalCollateralBalance(ssovContract, epoch) {
    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]
    return totalEpochDeposits;
}

async function getBnbApy() {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.BSC)

    const vbnbContract = new ethers.Contract(
        '0xA07c5b74C9B40447a954e1466938b865b6BBea36',
        ['function supplyRatePerBlock() external view returns (uint)'],
        provider
    )

    const blocksPerDay = 20 * 60 * 24
    const supplyRatePerBlock = await vbnbContract.supplyRatePerBlock()

    return (
        (Math.pow(
            (supplyRatePerBlock.toString() / 1e18) * blocksPerDay + 1,
            365 - 1
        ) -
            1) *
        100
    ).toFixed(2)
}

async function getGmxApy() {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const stakingContract = new ethers.Contract(
        '0xd2D1162512F927a7e282Ef43a362659E4F2a728F',
        ['function totalSupply() view returns (uint256)'],
        provider
    )

    const ssov = new ethers.Contract(
        '0x04996AFcf40A14D0892B00C816874F9C1A52C93B',
        ['function getUsdPrice() public view returns (uint256)'],
        provider
    )

    const ethSsov = new ethers.Contract(
        '0x711Da677a0D61Ee855DAd4241B552A706F529C70',
        ['function getUsdPrice() view returns (uint256)'],
        provider
    )

    const reader = new ethers.Contract(
        '0xF09eD52638c22cc3f1D7F5583e3699A075e601B2',
        [
            'function getTokenBalancesWithSupplies(address _account, address[] memory _tokens) public view returns (uint256[] memory)',
        ],
        provider
    )

    const balances = await reader.getTokenBalancesWithSupplies(
        '0x0000000000000000000000000000000000000000',
        [
            '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
            '0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA',
            '0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258',
            '0x908C4D94D34924765f1eDc22A1DD098397c59dD4',
        ]
    )

    const keys = ['gmx', 'esGmx', 'glp', 'stakedGmxTracker']
    const balanceData = {}
    const supplyData = {}
    const propsLength = 2

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        balanceData[key] = balances[i * propsLength]
        supplyData[key] = balances[i * propsLength + 1]
    }

    const stakedGmxTracker = supplyData.stakedGmxTracker
    const gmxPrice = (await ssov.getUsdPrice()) * 10 ** 22
    const tokensPerInterval = 677910052910052
    const secondsPerYear = 31536000
    const stakedGmxTrackerAnnualRewardsUsd =
        // eslint-disable-next-line
        (39776760107741941 * secondsPerYear * gmxPrice) / 10 ** 18
    const basisPointsDivisor = 10000
    const feeGmxSupply = await stakingContract.totalSupply()
    const feeGmxSupplyUsd = (feeGmxSupply * gmxPrice) / 10 ** 18
    const ethPrice = (await ethSsov.getUsdPrice()) * 10 ** 22
    const stakedGmxTrackerSupplyUsd = (stakedGmxTracker * gmxPrice) / 10 ** 18
    const gmxAprForEsGmx =
        (stakedGmxTrackerAnnualRewardsUsd * basisPointsDivisor) /
        stakedGmxTrackerSupplyUsd /
        100
    const feeGmxTrackerAnnualRewardsUsd =
        (tokensPerInterval * secondsPerYear * ethPrice) / 10 ** 18
    const gmxAprForNativeToken =
        (feeGmxTrackerAnnualRewardsUsd * basisPointsDivisor) /
        feeGmxSupplyUsd /
        100
    const gmxAprTotal = gmxAprForNativeToken + gmxAprForEsGmx

    return (((1 + gmxAprTotal / 365 / 100) ** 365 - 1) * 100).toFixed(2)
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

async function getDopexApy(name) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161][SSOV_VERSION].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const [startTime, expiry] = await ssovContract.getEpochTimes(epoch)

    const totalPeriod = expiry.toNumber() - startTime.toNumber()

    const rewards = await getRewardsFromStakingStrat(ssovContract);

    const tvl = await getTotalCollateralBalance(ssovContract, epoch)

    const rewardRate = rewards / totalPeriod

    const rewardsEmitted = rewardRate * (Date.now() - startTime)

    const denominator = tvl.toNumber() + rewardsEmitted.toNumber()

    let apr = (denominator / tvl.toNumber() - 1) * 100

    return Number((((1 + apr / 365 / 100) ** 365 - 1) * 100).toFixed(2))
}

async function getEthSsovV3Apy(name) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161][SSOV_VERSION].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [dpxPrice] = await getPrices(['dopex'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = await getTotalCollateralBalance(ssovContract, epoch)

    const dpxRewards = await getRewardsFromStakingStrat(ssovContract);

    const priceUnderlying =
        (await ssovContract.getUnderlyingPrice()).toNumber() / 10 ** 8

    const totalRewardsInUSD = dpxPrice * dpxRewards

    const totalEpochDepositsInUSD =
        totalEpochDeposits.div('1000000000000000000').toNumber() *
        priceUnderlying

    return Math.max(
        (
            ((totalRewardsInUSD / totalEpochDepositsInUSD) *
                52 *
                100 *
                effectivePeriod) /
            totalPeriod
        ).toFixed(2),
        0
    ).toFixed(2)
}

async function getSsovPutApy(name) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161][SSOV_VERSION].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [dpxPrice] = await getPrices(['dopex'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = await getTotalCollateralBalance(ssovContract, epoch)

    const totalRewardsInUSD = dpxPrice * 1.25

    const totalEpochDepositsInUSD = totalEpochDeposits
        .div('1000000000000000000')
        .toNumber()

    return Math.max(
        (
            4 +
            ((totalRewardsInUSD / totalEpochDepositsInUSD) *
                52 *
                100 *
                effectivePeriod) /
            totalPeriod
        ).toFixed(2),
        0
    ).toFixed(2)
}

async function getAvaxAPY() {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.AVAX)

    const rewardDistributorContract = new ethers.Contract(
        '0x45B2C4139d96F44667577C0D7F7a7D170B420324',
        ['function rewardSupplySpeeds(uint8 ,address) view returns (uint256)'],
        provider
    )

    const JAvaxContract = new ethers.Contract(
        '0xC22F01ddc8010Ee05574028528614634684EC29e',
        [
            'function supplyRatePerSecond() view returns (uint256)',
            'function totalSupply() view returns (uint256)',
            'function exchangeRateStored() view returns (uint256)',
        ],
        provider
    )

    const [
        supplyRatePerSecond,
        totalSupply,
        exchangeRateStored,
        rewardSupplySpeeds,
        [avaxPrice, joePrice],
    ] = await Promise.all([
        JAvaxContract.supplyRatePerSecond(),
        JAvaxContract.totalSupply(),
        JAvaxContract.exchangeRateStored(),
        rewardDistributorContract.rewardSupplySpeeds(
            0,
            '0xC22F01ddc8010Ee05574028528614634684EC29e'
        ),
        getPrices(['avalanche-2', 'joe']),
    ])

    const AvaxRewards =
        (Math.pow(
            (supplyRatePerSecond.toString() / 1e18) * 86400 + 1,
            365 - 1
        ) -
            1) *
        100

    const JoeRewardsUSD = new BN(rewardSupplySpeeds.toString())
        .multipliedBy(86400)
        .multipliedBy(365)
        .multipliedBy(joePrice)
        .dividedBy(1e18)
        .toNumber()

    const totalReserveUSD = new BN(totalSupply.toString())
        .multipliedBy(exchangeRateStored.toString())
        .multipliedBy(avaxPrice)
        .dividedBy(1e36)
        .toNumber()

    const joeRewards = (JoeRewardsUSD / totalReserveUSD) * 100

    return (Number(joeRewards) + Number(AvaxRewards)).toFixed(2)
}

const getZeroApy = () => {
    return '0'
}

const getMetisApy = async (name) => {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[1088][SSOV_VERSION].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [priceMETIS] = await getPrices(['metis-token'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = await getTotalCollateralBalance(ssovContract, epoch)

    const priceUnderlying =
        (await ssovContract.getUnderlyingPrice()).toNumber() / 10 ** 8

    const totalRewardsInUSD = priceMETIS * 200

    const totalEpochDepositsInUSD =
        totalEpochDeposits.div('1000000000000000000').toNumber() *
        priceUnderlying

    return Math.max(
        (
            ((totalRewardsInUSD / totalEpochDepositsInUSD) *
                52 *
                100 *
                effectivePeriod) /
            totalPeriod
        ).toFixed(2),
        0
    ).toFixed(2)
}

const NAME_TO_GETTER = {
    // TODO(komorebi): remove all since all contracts are V3-2 now
    // DPX: { fn: getZeroApy, args: [] },
    // RDPX: { fn: getZeroApy, args: [] },
    // ETH: { fn: getZeroApy, args: [] },
    // GOHM: { fn: getGohmApy, args: [] },
    // BNB: { fn: getBnbApy, args: [] },
    // GMX: { fn: getGmxApy, args: [] },
    // AVAX: { fn: getAvaxAPY, args: [] },

    'ETH-WEEKLY-CALLS-SSOV-V3-2': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3-2'],
    },
    'ETH-WEEKLY-CALLS-SSOV-V3': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3'],
    },
    'ETH-WEEKLY-CALLS-SSOV-V3-3': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3-3'],
    },
    'ETH-MONTHLY-CALLS-SSOV-V3': {
        fn: getEthSsovV3Apy,
        args: ['ETH-MONTHLY-CALLS-SSOV-V3'],
    },
    'DPX-MONTHLY-CALLS-SSOV-V3': {
        fn: getDopexApy,
        args: ['DPX-MONTHLY-CALLS-SSOV-V3'],
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3': {
        fn: getDopexApy,
        args: ['rDPX-MONTHLY-CALLS-SSOV-V3'],
    },
    'gOHM-MONTHLY-CALLS-SSOV-V3': {
        fn: getGohmApy,
        args: ['gOHM-MONTHLY-CALLS-SSOV-V3'],
    },
    'ETH-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['ETH-WEEKLY-PUTS-SSOV-V3'],
    },
    'DPX-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['DPX-WEEKLY-PUTS-SSOV-V3'],
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['rDPX-WEEKLY-PUTS-SSOV-V3'],
    },
    'BTC-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['BTC-WEEKLY-PUTS-SSOV-V3'],
    },
    'gOHM-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['gOHM-WEEKLY-PUTS-SSOV-V3'],
    },
    'GMX-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['GMX-WEEKLY-PUTS-SSOV-V3'],
    },
    'CRV-WEEKLY-PUTS-SSOV-V3': {
        fn: getSsovPutApy,
        args: ['CRV-WEEKLY-PUTS-SSOV-V3'],
    },
    'Metis-MONTHLY-CALLS-SSOV-V3': {
        fn: getMetisApy,
        args: ['Metis-MONTHLY-CALLS-SSOV-V3'],
    },
}

const getSsovApy = async (ssov) => {
    const { symbol, underlyingSymbol, version, type } = ssov
    let apy
    let name = underlyingSymbol
    if (version === 3) {
        name = symbol
    }
    if (version === 2 && type === 'PUT') {
        apy = '3.7'
    }
    try {
        apy = await NAME_TO_GETTER[name].fn(...NAME_TO_GETTER[name].args)
    } catch (err) {
        apy = getZeroApy()
    }

    return apy
}

export default getSsovApy
