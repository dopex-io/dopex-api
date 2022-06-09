import groupBy from 'lodash/groupBy'

import { VAULTS } from '../../../helpers/v2/constants'
import getIRVaultApy from '../../../helpers/v2/getIRVaultApy'
import getIRVaultTvl from '../../../helpers/v2/getIRVaultTvl'
import getIRVaultData from '../../../helpers/v2/getIRVaultData'

export default async (_req, res) => {
    try {
        const [data] = await Promise.all(
                VAULTS.map((vault) => {
                    return getIRVaultData(vault)
                })
            );

        const vaultArray = VAULTS.map((item, index) => {
            return {
                ...item,
                tvl: data[index].tvl,
                rate: data[index].rate,
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
