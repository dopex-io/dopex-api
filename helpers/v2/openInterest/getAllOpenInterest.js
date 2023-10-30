import getSsovOpenInterest from "./getSsovOpenInterest";
import getStraddleOpenInterest from "./getStraddleOpenInterest";

const getAllOpenInterest = async () => {
  try {
    const [ssovAmount, straddleAmount] = await Promise.all([
      getSsovOpenInterest(),
      getStraddleOpenInterest(),
    ]);
    return {
      total: ssovAmount + straddleAmount,
    };
  } catch (e) {
    console.error("Fail to getAllOpenInterest", e);
    return {
      total: 0,
    };
  }
};

export default getAllOpenInterest;
