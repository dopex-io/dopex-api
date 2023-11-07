# Endpoints

> Note: This version of the API is currently in beta and is subject to change.

The base URL for a hosted version of this API is `https://api.dopex.io/v2`

## Table of contents

1. [GET SSOVs](#ssovs)
2. [GET SSOV APYs](#ssov-apys)
3. [GET STRADDLES](#straddles)
4. [GET SUPPORTED TOKENS](#supported-tokens-for-pricing)
5. [GET PRICE](#token-oracle--coingecko-price)
6. [GET OLP](#options-liquidity-pool)
7. [GET PROTOCOL TVL](#protocol-tvl)
8. [GET PRODUCT TVL](#product-tvl)

## SSOVs

Returns data about the Dopex SSOVs

- **URL**

  `/ssovs`

- **Method:**

  `GET`

- **URL Params**

  - **Optional:** <br />
    `groupBy=[chainId, type etc defaults to chainId, use none for no grouping]`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/ssov'
  ```

---

## SSOV APYs

Gets the APYs for the requested SSOV

- **URL**

  `/ssov/apy?symbol=DPX-WEEKLY-CALLS-SSOV-V3`

- **Method:**

  `GET`

- **URL Params**

  - **Required:** <br />
    `symbol=[string]`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/ssov/apy?symbol=DPX-WEEKLY-CALLS-SSOV-V3'
  ```

---

## Straddles

Returns data about the Dopex Straddles

- **URL**

  `/straddles`

- **Method:**

  `GET`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/straddles'
  ```

---

## Supported Tokens for pricing

Returns the supported tokens for oracle and coingecko prices

- **URL**

  `/price`

- **Method:**

  `GET`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/price'
  ```

---

## Token Oracle & Coingecko Price

Returns the oracle and coingecko price in usd for dopex supported tokens

- **URL**

  `/price/[token]`

- **Method:**

  `GET`

- **URL Params**

  - **Required:** <br />
    `[token]` where token is any of our supported tokens

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/price/dpx'
  ```

---

## Options liquidity pool

Returns data about the Dopex SSOV LPs

- **URL**

  `/olp`

- **Method:**

  `GET`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/olp'
  ```

Returns utilizations about the Dopex SSOV LPs

- **URL**

  `/olp/utilizations?symbol=DPX-MONTHLY`

- **Method:**

  `GET`

- **URL Params**

  - **Required:** <br />
    `symbol=[string]`

- **Sample call:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/olp/utilizations?symbol=DPX-MONTHLY'
  ```

---

## Protocol TVL

Returns the total TVL of all Dopex Products. Allows you to query for specific products of the protocol as well. Leaving parameters empty returns total TVL.

Possible products are: ssov, atlantic-straddles, farms, vedpx

- **URL**

  `/tvl`

- **Method:**

  `GET`

- **Success response:**

  ```json
  { "tvl": "385272088.86094545716095555338" }
  ```

- **Sample calls:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/tvl'
  ```

---

## Product TVL

Returns the total TVL of a dopex product

Possible products are: ssov, vedpx

- **URL**

  `/tvl/[product]`

- **Method:**

  `GET`

- **Success response:**

  ```json
  { "tvl": "385272088.86094545716095555338" }
  ```

- **Sample calls:**

  ```bash
  curl --location --request GET 'https://api.dopex.io/v2/tvl/ssov'
  ```

---
