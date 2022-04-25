import { SSOVS } from '../../../helpers/v2/constants'
import getSsovApy from '../../../helpers/v2/getSsovApy'

export default async (req, res) => {
    try {
        const symbol = req.query.symbol

        if (!symbol) {
            res.status(500).json({ error: 'Symbol query param required.' })
        }

        const ssov = SSOVS.find((ssov) => {
            if (ssov.symbol === symbol) {
                return true
            }
        })

        if (!ssov) {
            res.status(500).json({
                error: 'No ssov found.',
            })
        }

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        if (ssov.retired) {
            res.json({ apy: 0 })
        }

        const apy = await getSsovApy(ssov)

        res.json({ apy })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
