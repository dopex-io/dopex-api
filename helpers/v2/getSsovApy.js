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

async function getDopexApy(name, asset) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161]['SSOV-V3'].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]

    const priceUnderlying =
        (await ssovContract.getUnderlyingPrice()).toNumber() / 10 ** 8

    const totalEpochDepositsInUSD =
        totalEpochDeposits.div('1000000000000000000').toNumber() *
        priceUnderlying

    if (asset === 'DPX') {
        const oldSsovContract = ERC20SSOV__factory.connect(
            Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].SSOV['DPX'].Vault,
            provider
        )

        const stakingRewardsAddress = await oldSsovContract.getAddress(
            '0x5374616b696e6752657761726473000000000000000000000000000000000000' // StakingRewards
        )
        const stakingRewardsContract = StakingRewards__factory.connect(
            stakingRewardsAddress,
            provider
        )

        let DPXemitted
        let RDPXemitted

        let [DPX, RDPX, totalSupply, [priceDPX, priceRDPX]] = await Promise.all(
            [
                stakingRewardsContract.rewardRateDPX(),
                stakingRewardsContract.rewardRateRDPX(),
                stakingRewardsContract.totalSupply(),
                getPrices(['dopex', 'dopex-rebate-token']),
            ]
        )
        const assetPrice = asset === 'DPX' ? priceDPX : priceRDPX

        const TVL = new BN(totalSupply.toString())
            .multipliedBy(assetPrice)
            .dividedBy(1e18)

        const rewardsDuration = new BN(86400 * 365)

        DPXemitted = new BN(DPX.toString())
            .multipliedBy(rewardsDuration)
            .multipliedBy(priceDPX)
            .dividedBy(1e18)
        RDPXemitted = new BN(RDPX.toString())
            .multipliedBy(rewardsDuration)
            .multipliedBy(priceRDPX)
            .dividedBy(1e18)

        const denominator =
            TVL.toNumber() + DPXemitted.toNumber() + RDPXemitted.toNumber()

        return ((denominator / TVL.toNumber() - 1) * 100).toFixed(2)
    } else {
        const totalRewardsInUSD = priceUnderlying * 1500

        return Math.max(
            (
                ((totalRewardsInUSD / totalEpochDepositsInUSD) *
                    12 *
                    100 *
                    effectivePeriod) /
                totalPeriod
            ).toFixed(2),
            0
        ).toFixed(2)
    }
}

async function getEthSsovV3Apy(name, dpxRewards) {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[42161]['SSOV-V3'].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [priceDPX] = await getPrices(['dopex'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]

    const priceUnderlying =
        (await ssovContract.getUnderlyingPrice()).toNumber() / 10 ** 8

    const totalRewardsInUSD = priceDPX * dpxRewards

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
        Addresses[42161]['SSOV-V3'].VAULTS[name],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [priceDPX] = await getPrices(['dopex'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]

    const totalRewardsInUSD = priceDPX * 1.25

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

const getMetisApy = async () => {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const ssovContract = SsovV3__factory.connect(
        Addresses[1088]['SSOV-V3'].VAULTS['Metis-WEEKLY-PUTS-SSOV-V3'],
        provider
    )

    const epoch = await ssovContract.currentEpoch()

    if (epoch.isZero()) return '0'

    const epochTimes = await ssovContract.getEpochTimes(epoch)

    const [priceMETIS] = await getPrices(['metis-token'])

    const totalPeriod = epochTimes[1].toNumber() - epochTimes[0].toNumber()

    const effectivePeriod =
        epochTimes[1].toNumber() - Math.floor(Date.now() / 1000)

    const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
        'totalCollateralBalance'
    ]

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
    DPX: { fn: getZeroApy, args: [] },
    RDPX: { fn: getZeroApy, args: [] },
    ETH: { fn: getZeroApy, args: [] },
    'ETH-WEEKLY-CALLS-SSOV-V3-2': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3-2', 25],
    },
    'ETH-WEEKLY-CALLS-SSOV-V3': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3', 25],
    },
    'ETH-WEEKLY-CALLS-SSOV-V3-3': {
        fn: getEthSsovV3Apy,
        args: ['ETH-WEEKLY-CALLS-SSOV-V3-3', 25],
    },
    'ETH-MONTHLY-CALLS-SSOV-V3-2': {
        fn: getEthSsovV3Apy,
        args: ['ETH-MONTHLY-CALLS-SSOV-V3-2', 75],
    },
    'DPX-MONTHLY-CALLS-SSOV-V3-2': {
        fn: getDopexApy,
        args: ['DPX-MONTHLY-CALLS-SSOV-V3-2', 'DPX'],
    },
    'rDPX-MONTHLY-CALLS-SSOV-V3-2': {
        fn: getDopexApy,
        args: ['rDPX-MONTHLY-CALLS-SSOV-V3-2', 'RDPX'],
    },
    'gOHM-MONTHLY-CALLS-SSOV-V3': {
        fn: getGohmApy,
        args: ['gOHM-MONTHLY-CALLS-SSOV-V3-2'],
    },
    'ETH-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['ETH-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'DPX-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['DPX-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'rDPX-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['rDPX-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'BTC-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['BTC-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'gOHM-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['gOHM-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'GMX-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['GMX-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'CRV-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['CRV-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'LUNA-WEEKLY-PUTS-SSOV-V3-2': {
        fn: getSsovPutApy,
        args: ['LUNA-WEEKLY-PUTS-SSOV-V3-2'],
    },
    'Metis-MONTHLY-CALLS-SSOV-V3': {
        fn: getMetisApy,
        args: [],
    },
    GOHM: { fn: getGohmApy, args: [] },
    BNB: { fn: getBnbApy, args: [] },
    GMX: { fn: getGmxApy, args: [] },
    AVAX: { fn: getAvaxAPY, args: [] },
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
        console.log(name);
        apy = await NAME_TO_GETTER[name].fn(...NAME_TO_GETTER[name].args)
    } catch (err) {
        console.log(err);
        apy = getZeroApy()
    }

    return apy
}

export default getSsovApy
