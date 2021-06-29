const { default: fetch } = require("node-fetch");

module.exports = async (id) => {
  const price = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  )
    .then((res) => res.json())
    .then((data) => {
      return data[id].usd;
    });

  return price;
};
