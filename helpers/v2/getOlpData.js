import { OptionLP__factory } from '../../mocks/factories/OptionLP__factory'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import getSsovTvl from './getSsovTvl'
import getStraddlesData from './getStraddlesData'
import { SSOVS } from './constants'

const USD_DECIMALS = BigNumber.from(10).pow(6)

function getSsovAddress(symbol) {
    return SSOVS.find((ssov) => ssov.symbol === symbol)?.address || ''
}

export default async (vault) => {
    const { underlyingSymbol, symbol, duration, chainId, address, parents } =
        vault

    const provider = getProvider(chainId)
    const olpContract = OptionLP__factory.connect(address, provider)

    let parentTvl = 0
    let liquidity = BigNumber.from(0)
    try {
        parents.map(async (parent) => {
            if (parent.includes('SSOV')) {
                const ssov = getSsovAddress(parent)
                const currentEpoch = await olpContract.getSsovEpoch(ssov)
                const strikeTokens = await olpContract.getSsovEpochStrikes(
                    ssov,
                    currentEpoch
                )

                let strikeTokensInfoPromise = []
                strikeTokens.map(async (token) => {
                    strikeTokensInfoPromise.push(
                        olpContract.getOptionTokenInfo(token)
                    )
                })

                liquidity = await Promise.all(strikeTokensInfoPromise).map(
                    (tokens) => {
                        return tokens.reduce(
                            (prev, position) =>
                                prev.add(position.tokenLiquidity),
                            BigNumber.from(0)
                        )
                    }
                )

                const tvl = await getSsovTvl(vault)
                parentTvl += tvl
            } else if (parent.includes('STRADDLE')) {
                const { tvl } = await getStraddlesData(vault)
                parentTvl += tvl
            }
        })
    } catch (err) {
        console.log(err)
    }

    return {
        underlyingSymbol: underlyingSymbol,
        symbol: symbol,
        duration: duration,
        chainId: chainId,
        address: address,
        parentTvl: parentTvl,
        tvl: liquidity.div(USD_DECIMALS).toNumber(),
    }
}
