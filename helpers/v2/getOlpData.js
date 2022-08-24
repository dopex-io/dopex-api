// import { Olp__factory } from '@dopex-io/sdk'
// import { BigNumber } from 'ethers'

// import getProvider from '../getProvider'

// export default async (vault) => {
//     const { chainId, address } = vault
//     const provider = getProvider(chainId)

//     const olpContract = Olp__factory.connect(
//         address,
//         provider
//     )

//     let currentEpoch, tvl, totalDeposits, epochData

//     try {
//         currentEpoch = await olpContract.currentEpoch()
//         epochData = await olpContract.epochData(currentEpoch)

//         totalDeposits = epochData['activeUsdDeposits']

//         tvl = totalDeposits
//     } catch (err) {
//         tvl = BigNumber.from('0')
//     }

//     return {
//         currentEpoch: currentEpoch.toString(),
//         tvl: tvl,
//         totalDeposits: totalDeposits,
//         epochTimes: {
//             startTime: epochData['startTime'].toString(),
//             expiry: epochData['expiry'].toString(),
//         }
//     }
// }
