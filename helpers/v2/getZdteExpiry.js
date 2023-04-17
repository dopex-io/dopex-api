import { Zdte__factory } from '../../mocks/factories/Zdte__factory'
import { providers } from '@0xsequence/multicall'
import { Wallet, ethers } from 'ethers'

function validPk(value) {
    try {
        new Wallet(value)
    } catch (e) {
        return false
    }
    return true
}

const KEEPER_PK = process.env['KEEPER_PK']
const INFURA_PROJECT_ID = process.env['INFURA_PROJECT_ID']

export default async () => {
    const chainId = 42161
    const address = '0x8f5f38c548804be178ac1889b1cf2516326f583c'

    const isKeeperValid = KEEPER_PK && validPk(KEEPER_PK)
    console.log('isKeeperValid: ', isKeeperValid)

    try {
        const provider = new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(
                `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
                chainId
            )
        )

        const wallet = new ethers.Wallet(KEEPER_PK)
        const signer = wallet.connect(provider)

        const zdte = await Zdte__factory.connect(address, provider)

        const tx = await zdte.connect(signer).keeperRun()
        const receipt = await tx.wait()

        return {
            isKeeperValid: isKeeperValid,
            receipt: receipt,
        }
    } catch (err) {
        console.log(err)
        throw new Error('fail to get zdte expiry', err)
    }
}
