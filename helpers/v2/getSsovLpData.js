import { SsovLp__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'

const DECIMALS_USD = BigNumber.from(10).pow(6)
const DECIMALS_TOKEN = BigNumber.from(10).pow(18)
const DECIMALS_STRIKE = BigNumber.from(10).pow(8)
const NULL = '0x0000000000000000000000000000000000000000'

async function getSsovLpTvlUtilization(olpContract, ssov) {
    if (ssov === NULL)
        return { tvl: BigNumber.from(0), utilization: BigNumber.from(0) }

    const currentEpoch = await olpContract.getSsovEpoch(ssov)
    const strikeTokens = await olpContract.getSsovOptionTokens(
        ssov,
        currentEpoch
    )

    let strikeTokensInfoPromise = []
    let lpPositionsPromise = []

    strikeTokens.map((token) => {
        strikeTokensInfoPromise.push(olpContract.getOptionTokenInfo(token))
        lpPositionsPromise.push(olpContract.getAllLpPositions(token))
    })

    const strikeTokenLpPositions = await Promise.all(lpPositionsPromise)
    const strikeTokensInfo = await Promise.all(strikeTokensInfoPromise)
    const currentPrice = await olpContract?.getSsovUnderlyingPrice(ssov)

    let utilization = BigNumber.from(0)
    strikeTokenLpPositions
        .flat()
        .filter(({ killed }) => !killed)
        .map((p) => {
            utilization = utilization.add(p.usdLiquidityUsed)
            utilization = utilization.add(
                p.underlyingLiquidityUsed
                    .mul(currentPrice)
                    .mul(DECIMALS_USD)
                    .div(DECIMALS_STRIKE)
                    .div(DECIMALS_TOKEN)
            )
        })

    let tvl = BigNumber.from(0)
    strikeTokensInfo.map((info) => {
        const usdLiq = info.usdLiquidity
        const underLiqToUsd = info.underlyingLiquidity
            .mul(currentPrice)
            .mul(DECIMALS_USD)
            .div(DECIMALS_STRIKE)
            .div(DECIMALS_TOKEN)
        tvl = tvl.add(usdLiq)
        tvl = tvl.add(underLiqToUsd)
    })

    return { tvl: tvl, utilization: utilization }
}

export default async (vault) => {
    const { underlyingSymbol, symbol, duration, chainId, token, address } =
        vault

    const provider = getProvider(chainId)
    const olpContract = SsovLp__factory.connect(address, provider)

    const [ssovCall, ssovPut] = await Promise.all([
        olpContract.getTokenVaultRegistry(token, false),
        olpContract.getTokenVaultRegistry(token, true),
    ])

    let expiryPut
    let expiryCall

    if (ssovPut !== NULL) {
        const epochPut = await olpContract.getSsovEpoch(ssovPut)
        expiryPut = await olpContract.getSsovExpiry(ssovCall, epochPut)
    }

    if (ssovCall !== NULL) {
        const epochCall = await olpContract.getSsovEpoch(ssovCall)
        expiryCall = await olpContract.getSsovExpiry(ssovCall, epochCall)
        console.log('expiryCall: ', expiryCall)
    }

    const [tvlUtilCall, tvlUtilPut] = await Promise.all([
        getSsovLpTvlUtilization(olpContract, ssovCall),
        getSsovLpTvlUtilization(olpContract, ssovPut),
    ])

    return {
        underlyingSymbol: underlyingSymbol,
        symbol: symbol,
        duration: duration,
        chainId: chainId,
        address: address,
        hasCall: ssovCall !== NULL,
        hasPut: ssovPut !== NULL,
        utilization: tvlUtilCall.utilization
            .add(tvlUtilPut.utilization)
            .div(DECIMALS_USD)
            .toNumber(),
        tvl: tvlUtilCall.tvl.add(tvlUtilPut.tvl).div(DECIMALS_USD).toNumber(),
        expiry: expiryCall.toString() ?? expiryPut.toString() ?? '-',
    }
}
