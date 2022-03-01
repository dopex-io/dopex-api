import fetch from "node-fetch";

export default async (id) => {
  const price = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,eth`
  )
    .then((res) => res.json())
    .then((data) => {
      return data[id];
    });

  return price;
};
