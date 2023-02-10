import { SsovLp__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import { getSsovLpUtil } from './getSsovLpUtil'

const DECIMALS_USD = BigNumber.from(10).pow(6)
const NULL = '0x0000000000000000000000000000000000000000'

export default async (vault) => {
    const { underlyingSymbol, symbol, duration, chainId, token, address } =
        vault

    try {
        const provider = getProvider(chainId)
        const olpContract = SsovLp__factory.connect(address, provider)

        const [ssovCall, ssovPut] = await Promise.all([
            olpContract.getTokenVaultRegistry(token, false),
            olpContract.getTokenVaultRegistry(token, true),
        ])

        let expiryPut
        let expiryCall
        let epochPut
        let epochCall

        if (ssovPut !== NULL) {
            epochPut = await olpContract.getSsovEpoch(ssovPut)
            expiryPut = await olpContract.getSsovExpiry(ssovPut, epochPut)
        }

        if (ssovCall !== NULL) {
            epochCall = await olpContract.getSsovEpoch(ssovCall)
            expiryCall = await olpContract.getSsovExpiry(ssovCall, epochCall)
        }

        const [tvlUtilCall, tvlUtilPut] = await Promise.all([
            getSsovLpUtil(olpContract, ssovCall, epochCall),
            getSsovLpUtil(olpContract, ssovPut, epochPut),
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
            tvl: tvlUtilCall.tvl
                .add(tvlUtilPut.tvl)
                .div(DECIMALS_USD)
                .toNumber(),
            expiry: expiryCall?.toString() ?? expiryPut?.toString() ?? '-',
        }
    } catch (err) {
        console.log(err)
        return {
            underlyingSymbol: underlyingSymbol,
            symbol: symbol,
            duration: duration,
            chainId: chainId,
            address: address,
            hasCall: false,
            hasPut: false,
            utilization: 0,
            tvl: 0,
            expiry: 0,
        }
    }
}
