import groupBy from 'lodash/groupBy'

import { VAULTS } from '../../../helpers/v2/constants'
import getVaultApy from '../../../helpers/v2/getVaultApy'
import getVaultTvl from '../../../helpers/v2/getVaultTvl'
import getVaultData from '../../../helpers/v2/getVaultData'

export default async (_req, res) => {
    try {
        const [tvls, apys, data] = await Promise.all([
            Promise.all(
                VAULTS.map((vault) => {
                    return getVaultTvl(vault)
                })
            ),
            Promise.all(
                VAULTS.map((vault) => {
                    return getVaultApy(vault)
                })
            ),
            Promise.all(
                VAULTS.map((vault) => {
                    return getVaultData(vault)
                })
            ),
        ])

        const vaultArray = VAULTS.map((item, index) => {
            return {
                ...item,
                tvl: tvls[index],
                apy: apys[index],
                currentEpoch: data[index].currentEpoch,
                totalEpochDeposits: data[index].totalEpochDeposits,
                underlyingPrice: data[index].underlyingPrice,
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
