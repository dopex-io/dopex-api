import groupBy from 'lodash/groupBy'

import { SSOVS } from '../../../helpers/v2/constants'
import getSsovApy from '../../../helpers/v2/getSsovApy'
import getSsovTvl from '../../../helpers/v2/getSsovTvl'
import getSsovData from '../../../helpers/v2/getSsovData'
import getSsovRewards from '../../../helpers/v2/getSsovRewards'

import cachedResponse from '../../../helpers/cachedResponse'

export default async (req, res) => {
    return cachedResponse(req, res, async (req) => {
        const _groupBy = req.query.groupBy ?? 'chainId'

        const _SSOVS = SSOVS.filter((ssov) => !ssov.retired)

        const [tvls, apys, data, rewards] = await Promise.all([
            Promise.all(
                _SSOVS.map((ssov) => {
                    return getSsovTvl(ssov)
                })
            ),
            Promise.all(
                _SSOVS.map((ssov) => {
                    return getSsovApy(ssov)
                })
            ),
            Promise.all(
                _SSOVS.map((ssov) => {
                    return getSsovData(ssov)
                })
            ),
            Promise.all(
                _SSOVS.map((ssov) => {
                    return getSsovRewards(ssov)
                })
            ),
        ])

        const ssovArray = _SSOVS.map((item, index) => {
            return {
                ...item,
                tvl: tvls[index],
                apy: apys[index],
                rewards: rewards[index],
                currentEpoch: data[index].currentEpoch,
                totalEpochDeposits: data[index].totalEpochDeposits,
                totalEpochPurchases: data[index].totalEpochPurchases,
                underlyingPrice: data[index].underlyingPrice,
                epochTimes: data[index].epochTimes,
            }
        })

        const fData =
            _groupBy === 'none' ? ssovArray : groupBy(ssovArray, _groupBy)

        return { ...fData }
    })
}
