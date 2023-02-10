import { SSOV_LPS } from './constants'
import { SsovLp__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import { getSsovLpUtil } from './getSsovLpUtil'

const DECIMALS_USD = BigNumber.from(10).pow(6)

const getCallPutUtils = async (olpContract, epochs1, ssov1, epochs2, ssov2) => {
    let utilizations = []
    await Promise.all(
        epochs1.map(async (e) => {
            utilizations.push(
                await (
                    await getSsovLpUtil(olpContract, ssov1, e)
                ).utilization
            )
        })
    )
    await Promise.all(
        epochs2.map(async (e, idx) =>
            utilizations[idx].add(
                await (
                    await getSsovLpUtil(olpContract, ssov2, e)
                ).utilization
            )
        )
    )
    return utilizations
}

const getSsovLpUtils = async (querySymbol) => {
    const vault = SSOV_LPS.find(
        (vault) => !vault.retired && vault.symbol === querySymbol
    )
    const { chainId, token, address } = vault

    try {
        const provider = getProvider(chainId)
        const olpContract = SsovLp__factory.connect(address, provider)

        const [ssovCall, ssovPut] = await Promise.all([
            olpContract.getTokenVaultRegistry(token, false),
            olpContract.getTokenVaultRegistry(token, true),
        ])

        const [epochsCall, epochsPut] = await Promise.all([
            olpContract.getSsovEpochs(ssovCall),
            olpContract.getSsovEpochs(ssovPut),
        ])

        let utilizations = []
        if (epochsCall.length < epochsPut.length) {
            utilizations = await getCallPutUtils(
                olpContract,
                epochsPut,
                ssovPut,
                epochsCall,
                ssovCall
            )
        } else {
            utilizations = await getCallPutUtils(
                olpContract,
                epochsCall,
                ssovCall,
                epochsPut,
                ssovPut
            )
        }

        return utilizations.map((u) => u.div(DECIMALS_USD).toNumber())
    } catch (err) {
        console.log(err)
        return []
    }
}

export default getSsovLpUtils
