import { ERC20__factory, Addresses } from '@dopex-io/sdk'
import { utils as ethersUtils } from 'ethers'

import getProvider from '../getProvider'
import getPrice from '../getPrice'

export default async () => {
    const provider = getProvider(42161)

    const dpxContract = ERC20__factory.connect(Addresses[42161].DPX, provider)

    let tvl = 0

    try {
        const { usd: dpxPrice } = await getPrice('dopex')
        const dpxBalance = await dpxContract.balanceOf(
            '0x80789D252A288E93b01D82373d767D71a75D9F16' // veDPX Contract address
        )

        tvl = Number(ethersUtils.formatEther(dpxBalance)) * dpxPrice
    } catch (err) {
        console.log(err)
    }

    return tvl
}
