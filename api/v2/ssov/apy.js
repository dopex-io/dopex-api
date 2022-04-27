import { SSOVS } from '../../../helpers/v2/constants'
import getSsovApy from '../../../helpers/v2/getSsovApy'

export default async (req, res) => {
    try {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
        const symbol = req.query.symbol

        if (!symbol) {
            return res
                .status(400)
                .json({ error: 'Symbol query param required.' })
        }

        const ssov = SSOVS.find((ssov) => {
            if (ssov.symbol === symbol) {
                return true
            }
        })

        if (!ssov) {
            return res.status(404).json({
                error: 'No ssov found.',
            })
        }

        if (ssov.retired) {
            return res.json({ apy: 0 })
        }

        const apy = await getSsovApy(ssov)

        return res.json({ apy })
    } catch (err) {
        console.log(err)

        return res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
