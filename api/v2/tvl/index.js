import { SSOVS, STRADDLES } from '../../../helpers/v2/constants'
import getSsovTvl from '../../../helpers/v2/getSsovTvl'
import getStraddlesData from '../../../helpers/v2/getStraddlesData'
import getFarmTvl from '../../../helpers/getFarmTvl'
import getPrice from '../../../helpers/getPrice'
import getVedpxTvl from '../../../helpers/v2/getVedpxTvl'

export default async (_req, res) => {
    try {
        let tvl = 0

        const _SSOVS = SSOVS.filter((ssov) => !ssov.retired)

        const tvls = await Promise.all(
            _SSOVS.map((ssov) => {
                return getSsovTvl(ssov)
            })
        )

        tvl += tvls.reduce((acc, item) => {
            return acc + Number(item)
        }, 0)

        const straddleDataArray = await Promise.all(
            STRADDLES.map((straddle) => {
                return getStraddlesData(straddle)
            })
        )

        tvl += straddleDataArray.reduce((acc, item) => {
            return acc + Number(item.tvl)
        }, 0)

        const { usd: ethPrice } = await getPrice('ethereum')

        const farmTvls = await Promise.all([
            getFarmTvl('DPX-WETH', ethPrice),
            getFarmTvl('RDPX-WETH', ethPrice),
        ])

        tvl += farmTvls.reduce((acc, item) => {
            return acc + item.toNumber()
        }, 0)

        tvl += await getVedpxTvl()

        tvl = String(tvl)

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        res.json({ tvl })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
