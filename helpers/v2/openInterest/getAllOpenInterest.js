import getSsovOpenInterest from './getSsovOpenInterest'
import getZdteOpenInterest from './getZdteOpenInterest'
import getStraddleOpenInterest from './getStraddleOpenInterest'
import getScalpsOpenInterest from './getScalpsOpenInterest'
import getAtlanticPutsOpenInterest from './getAtlanticPutsOpenInterest'

const getAllOpenInterest = async () => {
    try {
        const [
            ssovAmount,
            zdteAmount,
            straddleAmount,
            scalpsAmount,
            atlanticsAmount,
        ] = await Promise.all([
            getSsovOpenInterest(),
            getZdteOpenInterest(),
            getStraddleOpenInterest(),
            getScalpsOpenInterest(),
            getAtlanticPutsOpenInterest(),
        ])
        return {
            total:
                ssovAmount +
                straddleAmount +
                zdteAmount +
                scalpsAmount +
                atlanticsAmount,
        }
    } catch (e) {
        console.error('Fail to getAllOpenInterest', e)
        return {
            total: 0,
        }
    }
}

export default getAllOpenInterest
