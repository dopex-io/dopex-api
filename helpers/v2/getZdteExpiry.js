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
const CONTRACT = '0x73136bfb1cdb9e424814011d00e11989c3a82d38'
const CHAIN_ID = 42161

export default async () => {
    const isKeeperValid = KEEPER_PK && validPk(KEEPER_PK)

    try {
        const provider = new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(
                `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
                CHAIN_ID
            )
        )

        const wallet = new ethers.Wallet(KEEPER_PK)
        const signer = wallet.connect(provider)

        const zdte = await Zdte__factory.connect(CONTRACT, provider)
        const tx = await zdte.connect(signer).keeperRun()
        const price = await zdte.getMarkPrice()
        const receipt = await tx.wait()

        return {
            isKeeperValid: isKeeperValid,
            receipt: receipt,
            price: price.toNumber(),
        }
    } catch (err) {
        console.log(err)
        throw new Error('fail to get zdte expiry', err)
    }
}
