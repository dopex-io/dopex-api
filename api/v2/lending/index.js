import groupBy from 'lodash/groupBy'
import { SSOVS, SSOVS_LENDING } from '../../../helpers/v2/constants'
import getSsovLendingData from '../../../helpers/v2/getSsovLendingData'

export default async (req, res) => {
    try {
        const _groupBy = req.query.groupBy ?? 'chainId'

        const ssovs = await Promise.all(
            // SSOVS.filter(
            SSOVS_LENDING.filter(
                (ssov) => !ssov.retired && ssov.type == 'put'
            ).map((ssov) => {
                return getSsovLendingData(ssov)
            })
        )

        const data = _groupBy === 'none' ? ssovs : groupBy(ssovs, _groupBy)

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        return res.json({ ...data })
    } catch (err) {
        console.log(err)

        return res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
