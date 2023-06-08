import { Addresses } from '@dopex-io/sdk'

import getMerkleClaim from '../../../../helpers/v2/quest/getMerkleClaim'
import dopexHalloweenAddresses from '../../../../constants/json/dopexHalloweenAddresses.json'

export default async (req, res) => {
    try {
        const result = await getMerkleClaim({
            accountAddress: req.query.address,
            chainId: 42161,
            contractAddress: Addresses[42161]['NFTS']['DopexHalloweenNFT'],
            treeData: dopexHalloweenAddresses,
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
