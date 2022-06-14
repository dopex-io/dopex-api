import groupBy from 'lodash/groupBy'
import {utils as ethersUtils} from "ethers/lib/ethers";

import { VAULTS } from '../../../helpers/v2/constants'
import getIRVaultData from '../../../helpers/v2/getIRVaultData'


export default async (_req, res) => {
    try {
        const data = await Promise.all(
                VAULTS.map((vault) => {
                    return getIRVaultData(vault)
                })
            );

        const vaultArray = VAULTS.map((item, index) => {
            return {
                ...item,
                tvl: ethersUtils.formatUnits(data[index].tvl, 18),
                rate: ethersUtils.formatUnits(data[index].rate, 8).toString(),
                currentEpoch: data[index].currentEpoch,
                totalEpochDeposits: ethersUtils.formatUnits(data[index].totalEpochDeposits, 18)
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
