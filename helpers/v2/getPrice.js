import axios from "axios";

import redis from "../redis";

export default async (id) => {
  let price = await redis.get(id + "-json");

  if (!price) {
    price = await axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
      )
      .then(async (payload) => {
        const _price = {
          price: payload.data[id].usd,
          change24h: payload.data[id].usd_24h_change,
        };

        await redis.set(id + "-json", JSON.stringify(_price), { ex: 60 });

        return _price;
      });
  }

  return price;
};
