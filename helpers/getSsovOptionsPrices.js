import { Addresses, ERC20SSOV__factory } from '@dopex-io/sdk'
import BN from 'bignumber.js'
import { ethers } from 'ethers'

import { TOKEN_TO_CG_ID } from './constants'
import getProvider from './getProvider'
import getPrice from './getPrice'

export default async (token, type, chainId) => {
    const contractAddresses = Addresses[chainId]
    const provider = getProvider(chainId)

    const ssovAddress =
        type === 'put'
            ? contractAddresses['2CRV-SSOV-P'][token].Vault
            : contractAddresses.SSOV[token].Vault

    const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider)

    let epoch = await ssovContract.currentEpoch()
    let isEpochExpired = await ssovContract.isEpochExpired(epoch)

    if (epoch.isZero()) {
        epoch = 1
    } else if (isEpochExpired) {
        epoch = epoch.add(1)
    }

    const [strikes, tokenPrice] = await Promise.all([
        ssovContract.getEpochStrikes(epoch),
        getPrice(TOKEN_TO_CG_ID[token]),
    ])

    const optionsPrices = {}
    const currentPrice = await ssovContract.getUsdPrice()
    const amount = 1e18
    let i

    const converter =
        token === 'BNB' &&
        new ethers.Contract(
            ssovContract.address,
            [
                'function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)',
            ],
            provider
        )

    for (i in strikes) {
        const strike = strikes[i].toNumber()
        let premium = await ssovContract.calculatePremium(
            strike,
            amount.toString()
        )
        let fees = await ssovContract.calculatePurchaseFees(
            currentPrice,
            strike,
            amount.toString()
        )

        if (token === 'BNB' && type === 'CALL') {
            premium = await converter.vbnbToBnb(premium)
            fees = await converter.vbnbToBnb(fees)
        }

        optionsPrices[BN(strikes[i].toString()).dividedBy(1e8)] = {
            premium: BN(premium.toString()).dividedBy(1e18),
            fees: BN(fees.toString()).dividedBy(1e18),
            total: BN(premium.add(fees).toString()).dividedBy(1e18),
            usd: BN(premium.add(fees).toString())
                .dividedBy(1e18)
                .multipliedBy(tokenPrice),
        }
    }

    return optionsPrices
}
