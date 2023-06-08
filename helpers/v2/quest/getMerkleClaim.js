import { ethers } from 'ethers'
import { MerkleDistributor__factory } from '@dopex-io/sdk'

import getProvider from '../../getProvider'
import BalanceTree from '../../../utils/merkle/balance-tree'

const getMerkleClaim = async ({
    accountAddress,
    chainId,
    contractAddress,
    treeData,
}) => {
    const provider = getProvider(chainId)

    const isAddress = ethers.utils.isAddress(accountAddress)

    let error = ''
    let valid = false
    let data

    if (!isAddress) {
        error = 'Not an address'
    } else {
        const index = treeData.findIndex(
            (item) =>
                item.account.toLowerCase() === accountAddress?.toLowerCase()
        )

        if (index !== -1) {
            const amount = treeData[index].amount

            const tree = new BalanceTree(treeData)

            if (index >= 0) {
                const merkleDistributorContract =
                    MerkleDistributor__factory.connect(
                        contractAddress,
                        provider
                    )

                const isClaimed = await merkleDistributorContract.isClaimed(
                    index
                )

                if (!isClaimed) {
                    const proof = tree.getProof(index, accountAddress, amount)

                    data = {
                        index,
                        address: accountAddress,
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

export default getMerkleClaim
