import groupBy from 'lodash/groupBy'

import { ATLANTIC_POOLS } from '../../../helpers/v2/constants'
import getAtlanticsData from '../../../helpers/v2/getAtlanticsData'

export default async (_req, res) => {
    try {
        const underlyingList = Object.keys(ATLANTIC_POOLS)

        const data = await Promise.all(
            underlyingList
                .map((underlying) => {
                    return ATLANTIC_POOLS[underlying].map((pool) => {
                        return getAtlanticsData(pool)
                    })
                })
                .flat()
        )

        console.log('Data: ', data)

        const vaultArray = data.map((item, i) => {
            return { ...ATLANTIC_POOLS[item.underlying][i], ...item }
        })

        const fData = groupBy(vaultArray, 'underlying')

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        res.json({ ...fData })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
