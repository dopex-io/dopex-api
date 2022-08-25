import groupBy from 'lodash/groupBy'
import { ROLPS } from '../../../helpers/v2/constants'
import { getRolpData } from '../../../helpers/v2/getRolpData'

export default async (_req, res) => {
    try {
        const data = await Promise.all(
            ROLPS.filter((vault) => !vault.retired).map((vault) => {
                return getRolpData(vault)
            })
        )

        const pools = data.map((item, index) => {
            return {
                ...item,
                underlyingSymbol: data[index].underlyingSymbol,
                symbol: data[index].symbol,
                duration: data[index].duration,
                chainId: data[index].chainId,
                address: data[index].address,
                parentTvl: data[index].parentTvl,
                tvl: data[index].tvl,
            }
        })

        const fData = groupBy(pools, 'underlyingSymbol')
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
