import groupBy from 'lodash/groupBy'
import { OLPS } from '../../../helpers/v2/constants'
import getOlpData from '../../../helpers/v2/getOlpData'

export default async (_req, res) => {
    try {
        const data = await Promise.all(
            OLPS.filter((vault) => !vault.retired).map((vault) => {
                return getOlpData(vault)
            })
        )

        const vaultArray = data.map((item, index) => {
            return {
                ...item,
                underlyingSymbol: data[index].underlyingSymbol,
                symbol: data[index].symbol,
                duration: data[index].duration,
                chainId: data[index].chainId,
                address: data[index].address,
                tvl: data[index].tvl,
            }
        })

        const fData = groupBy(vaultArray, 'chainId')

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
