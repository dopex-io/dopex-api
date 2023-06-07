import { ethers } from 'ethers'
import { Addresses, MerkleDistributor__factory } from '@dopex-io/sdk'

import getProvider from '../../getProvider'
import airdropAddresses from '../../../constants/json/airdropAddresses.json'
import BalanceTree from '../../../utils/merkle/balance-tree'

const getRdpxAirdrop = async (address) => {
    const provider = getProvider(1)

    const isAddress = ethers.utils.isAddress(address)

    let error = ''
    let valid = false
    let data

    if (!isAddress) {
        error = 'Not an address'
    } else {
        const index = airdropAddresses.findIndex(
            (item) => item.account.toLowerCase() === address?.toLowerCase()
        )

        if (index !== -1) {
            const amount = airdropAddresses[index].amount

            const tree = new BalanceTree(airdropAddresses)

            if (index >= 0) {
                const merkleDistributorContract =
                    MerkleDistributor__factory.connect(
                        Addresses[1]['MerkleDistributor'],
                        provider
                    )

                const isClaimed = await merkleDistributorContract.isClaimed(
                    index
                )

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

export default getRdpxAirdrop
