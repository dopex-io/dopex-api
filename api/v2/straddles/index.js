import groupBy from 'lodash/groupBy'

import { STRADDLES } from '../../../helpers/v2/constants'
import getStraddlesData from '../../../helpers/v2/getStraddlesData'

export default async (_req, res) => {
    try {
        const data = await Promise.all(
            STRADDLES.map((vault) => {
                return getStraddlesData(vault)
            })
        )

        const vaultArray = STRADDLES.map((item, index) => {
            return {
                ...item,
                ...data[index],
            }
        })

        const fData = groupBy(vaultArray, 'chainId')

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
