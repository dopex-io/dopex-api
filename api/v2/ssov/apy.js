import cachedResponse from '../../../helpers/cachedResponse'
import { SSOVS } from '../../../helpers/v2/constants'
import getSsovApy from '../../../helpers/v2/getSsovApy'

export default async (req, res) => {
    return cachedResponse(req, res, async (req, res) => {
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

        let apy = 0

        if (!ssov.retired) {
            apy = await getSsovApy(ssov)
        }

        return { apy }
    })
}
