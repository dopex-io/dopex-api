import groupBy from 'lodash/groupBy'

import { SSOVS } from '../../../helpers/v2/constants'
import getSsovApy from '../../../helpers/v2/getSsovApy'
import getSsovTvl from '../../../helpers/v2/getSsovTvl'
import getSsovData from '../../../helpers/v2/getSsovData'

export default async (_req, res) => {
    try {
        const [tvls, apys, data] = await Promise.all([
            Promise.all(
                SSOVS.map((ssov) => {
                    return getSsovTvl(ssov)
                })
            ),
            Promise.all(
                SSOVS.map((ssov) => {
                    return getSsovApy(ssov)
                })
            ),
            Promise.all(
                SSOVS.map((ssov) => {
                    return getSsovData(ssov)
                })
            ),
        ])

        const ssovArray = SSOVS.map((item, index) => {
            return {
                ...item,
                tvl: tvls[index].toString(),
                apy: apys[index],
                currentEpoch: data[index].currentEpoch,
                totalEpochDeposits: data[index].totalEpochDeposits,
                epochStartDate: data[index].epochStartDate,
                epochEndDate: data[index].epochEndDate,
                underlyingPrice: data[index].underlyingPrice,
            }
        })

        const fData = groupBy(ssovArray, 'chainId')

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
