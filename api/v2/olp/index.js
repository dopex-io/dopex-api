import groupBy from 'lodash/groupBy'
import { utils as ethersUtils } from 'ethers/lib/ethers'

import { OLPS } from '../../../helpers/v2/constants'
import getStraddlesData from '../../../helpers/v2/getStraddlesData'
import getSsovData from '../../../helpers/v2/getSsovData'

export default async (_req, res) => {
    try {
        const data = OLPS.filter((vault) => !vault.retired)

        const vaultArray = data.map((item, index) => {
            return {
                ...item,
            }
        })

        const fData = groupBy(vaultArray, 'underlyingSymbol')

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
