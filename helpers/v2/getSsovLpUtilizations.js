import { SSOV_LPS } from './constants'
import { SsovLp__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import { getSsovLpUtilization } from './getSsovLpUtilization'

const DECIMALS_USD = BigNumber.from(10).pow(6)

const getCallPutUtilizations = async (
    olpContract,
    epochs1,
    ssov1,
    epochs2,
    ssov2
) => {
    let utilizations = []
    await Promise.all(
        epochs1.map(async (e) => {
            utilizations.push(
                await (
                    await getSsovLpUtilization(olpContract, ssov1, e)
                ).utilization
            )
        })
    )
    await Promise.all(
        epochs2.map(async (e, idx) =>
            utilizations[idx].add(
                await (
                    await getSsovLpUtilization(olpContract, ssov2, e)
                ).utilization
            )
        )
    )
    return utilizations
}

const getSsovLpUtilizations = async (querySymbol) => {
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
            utilizations = await getCallPutUtilizations(
                olpContract,
                epochsPut,
                ssovPut,
                epochsCall,
                ssovCall
            )
        } else {
            utilizations = await getCallPutUtilizations(
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

export default getSsovLpUtilizations
