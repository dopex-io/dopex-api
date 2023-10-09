import getSsovOpenInterest from './getSsovOpenInterest'
import getStraddleOpenInterest from './getStraddleOpenInterest'
import getScalpsOpenInterest from './getScalpsOpenInterest'

const getAllOpenInterest = async () => {
    try {
        const [ssovAmount, straddleAmount, scalpsAmount] = await Promise.all([
            getSsovOpenInterest(),
            getStraddleOpenInterest(),
            getScalpsOpenInterest(),
        ])
        return {
            total: ssovAmount + straddleAmount + scalpsAmount,
        }
    } catch (e) {
        console.error('Fail to getAllOpenInterest', e)
        return {
            total: 0,
        }
    }
}

export default getAllOpenInterest
