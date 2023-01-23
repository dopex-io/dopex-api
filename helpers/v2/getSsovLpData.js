import { SsovLp__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'

const DECIMALS_USD = BigNumber.from(10).pow(6)
const DECIMALS_TOKEN = BigNumber.from(10).pow(18)
const DECIMALS_STRIKE = BigNumber.from(10).pow(8)

export default async (vault) => {
    const {
        underlyingSymbol,
        symbol,
        duration,
        chainId,
        isPut,
        token,
        address,
    } = vault

    const provider = getProvider(chainId)
    const olpContract = SsovLp__factory.connect(address, provider)

    const ssov = await olpContract.getTokenVaultRegistry(token, isPut)
    const currentEpoch = await olpContract.getSsovEpoch(ssov)
    const strikeTokens = await olpContract.getSsovOptionTokens(
        ssov,
        currentEpoch
    )

    let strikeTokensInfoPromise = []
    strikeTokens.map((token) => {
        strikeTokensInfoPromise.push(olpContract.getOptionTokenInfo(token))
    })

    const strikeTokensInfo = await Promise.all(strikeTokensInfoPromise)
    const currentPrice = await olpContract?.getSsovUnderlyingPrice(ssov)

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

    return {
        underlyingSymbol: underlyingSymbol,
        symbol: symbol,
        duration: duration,
        chainId: chainId,
        address: address,
        tvl: tvl.div(DECIMALS_USD).toNumber(),
    }
}
