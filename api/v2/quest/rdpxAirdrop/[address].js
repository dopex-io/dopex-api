import { Addresses } from '@dopex-io/sdk'

import getMerkleClaim from '../../../../helpers/v2/quest/getMerkleClaim'
import rdpxAirdropAddresses from '../../../../constants/json/rdpxAirdropAddresses.json'

export default async (req, res) => {
    try {
        const result = await getMerkleClaim({
            accountAddress: req.query.address,
            chainId: 1,
            contractAddress: Addresses[1]['MerkleDistributor'],
            treeData: rdpxAirdropAddresses,
        })

        res.json({
            ...result,
        })
    } catch (err) {
        console.log(err)

        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
