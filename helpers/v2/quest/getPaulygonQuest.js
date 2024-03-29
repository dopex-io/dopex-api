import { ethers } from 'ethers'

import { getBuiltGraphSDK } from '../../../.graphclient'

const sdk = getBuiltGraphSDK()

const getPaulygonQuest = async (address) => {
    const isAddress = ethers.utils.isAddress(address)
    let error = ''
    let valid = false
    if (!isAddress) {
        error = 'Not an address'
    } else {
        const [depositData, purchaseData] = await Promise.all([
            sdk.getStraddleDeposits({
                epoch_gte: '46',
                epoch_lte: '70',
                amount: '50000000',
            }),
            sdk.getStraddlePurchases({
                epoch_gte: '46',
                epoch_lte: '70',
                cost: '4500000000000000000000000000',
            }),
        ])

        console.log(depositData, purchaseData)

        for (let i = 0; i < depositData.deposits.length; i++) {
            const item = depositData.deposits[i]
            const _address = item.id.split('#')[0]
            if (_address.toLowerCase() === address.toLowerCase()) {
                valid = true
            }
        }

        for (let i = 0; i < purchaseData.straddlePurchases.length; i++) {
            const item = purchaseData.straddlePurchases[i]
            const _address = item.id.split('#')[0]
            if (_address.toLowerCase() === address.toLowerCase()) {
                valid = true
            }
        }
    }

    return { valid, error }
}

export default getPaulygonQuest
