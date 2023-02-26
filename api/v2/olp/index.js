import groupBy from 'lodash/groupBy'

import { SSOV_LPS } from '../../../helpers/v2/constants'

import getSsovLpData from '../../../helpers/v2/getSsovLpData'

export default async (_req, res) => {
    try {
        const data = await Promise.all(
            SSOV_LPS.filter((vault) => !vault.retired).map((vault) => {
                return getSsovLpData(vault)
            })
        )

        const fData = groupBy(data, 'chainId')

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
