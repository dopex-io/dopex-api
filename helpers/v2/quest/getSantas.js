import { ethers } from 'ethers'
import { Addresses, BaseNFT__factory } from '@dopex-io/sdk'

import getProvider from '../../getProvider'
import dopexSantasAddresses from '../../../constants/json/dopexSantasAddresses.json'
import BalanceTree from '../../../utils/merkle/balance-tree'

const getHalloween = async (address) => {
    const provider = getProvider(1)

    const isAddress = ethers.utils.isAddress(address)

    let error = ''
    let valid = false
    let data

    if (!isAddress) {
        error = 'Not an address'
    } else {
        const index = dopexSantasAddresses.findIndex(
            (item) => item.account.toLowerCase() === address?.toLowerCase()
        )

        if (index !== -1) {
            const amount = dopexSantasAddresses[index].amount

            const tree = new BalanceTree(dopexSantasAddresses)

            if (index >= 0) {
                const contract = BaseNFT__factory.connect(
                    Addresses[42161]['NFTS']['DopexSantasNFT'],
                    provider
                )

                const isClaimed = await contract.isClaimed(index)

                if (!isClaimed) {
                    const proof = tree.getProof(index, address, amount)

                    data = {
                        index,
                        address,
                        amount,
                        proof,
                    }

                    valid = true
                }
            }
        }
    }

    return { valid, error, data }
}

export default getHalloween
