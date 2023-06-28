import { BigNumber } from 'ethers'

import { getBuiltGraphSDK } from '../../../.graphclient'

import getSsov24hVolume from './getSsov24hVolume'
import getStraddle24hVolume from './getStraddle24hVolume'
import getScalpsOrZdte24hVolume from './getScalpsOrZdte24hVolume'
import getAtlantics24hVolume from './getAtlantics24hVolume'

import getSsovTokenPrice from '../getSsovTokenPrice'
import { SCALPS, ZDTES } from '../constants'

const sdk = getBuiltGraphSDK()

const getAll24hVolume = async () => {
    const now = BigNumber.from(
        Number(new Date().getTime() / 1000 - 86400).toFixed(0)
    ).toString()

    let scalpsAmount = 0
    let ssovAmount = 0
    let straddleAmount = 0
    let zdteAmount = 0
    let atlanticsAmount = 0

    const tokenToPrice = await getSsovTokenPrice()

    try {
        const scalpsPayload = await sdk.getScalpsVolume({
            fromTimestamp: now,
        })
        scalpsAmount = await getScalpsOrZdte24hVolume(
            scalpsPayload,
            tokenToPrice,
            SCALPS
        )
    } catch (e) {
        console.error('Fail to get for scalpsPayload', e)
    }

    try {
        const ssovPayload = await sdk.getSsovVolume({
            fromTimestamp: now,
        })
        ssovAmount = await getSsov24hVolume(ssovPayload, tokenToPrice)
    } catch (e) {
        console.error('Fail to get for ssovPayload', e)
    }

    try {
        const [straddlePayload, straddlePolygonPayload] = await Promise.all([
            sdk.getStraddleVolume({
                fromTimestamp: now,
            }),
            sdk.getStraddlePolygonVolume({
                fromTimestamp: now,
            }),
        ])
        const [straddleEthAmount, straddlePolygonAmount] = await Promise.all([
            getStraddle24hVolume(straddlePayload, tokenToPrice),
            getStraddle24hVolume(straddlePolygonPayload, tokenToPrice),
        ])
        straddleAmount = straddleEthAmount + straddlePolygonAmount
    } catch (e) {
        console.error('Fail to get for straddlePayload', e)
    }

    try {
        const zdtePayload = await sdk.getZdteVolume({
            fromTimestamp: now,
        })
        zdteAmount = await getScalpsOrZdte24hVolume(
            zdtePayload,
            tokenToPrice,
            ZDTES
        )
    } catch (e) {
        console.error('Fail to get for zdtePayload', e)
    }

    try {
        const atlanticsPayload = await sdk.getAtlanticsVolume({
            fromTimestamp: now,
        })
        atlanticsAmount = await getAtlantics24hVolume(atlanticsPayload)
    } catch (e) {
        console.error('Fail to get for atlanticsPayload', e)
    }

    return {
        total:
            scalpsAmount +
            ssovAmount +
            straddleAmount +
            zdteAmount +
            atlanticsAmount,
    }
}

export default getAll24hVolume
