# Dopex API

Built with Vercel's serverless functions.

Read more here - https://vercel.com/docs/serverless-functions/introduction

# Table of contents

1. [SSOVs](#ssovs)
2. [Deposits per strike](#depositsperstrike)
3. [Options prices](#optionsprices)
4. [Options usage](#optionsusage)
5. [DPX/rDPX Token price](#tokenprice)
6. [DPX/rDPX Token Supply Information](#tokensupply)
7. [DPX/rDPX Market cap](#marketcap)
8. [APY](#apy)
9. [TVL](#tvl)
10. [Dopex Farms TVL per pool](#dopexfarmstvlperpool)
11. [Dopex TVL per contract](#dopextvlpercontract)

## SSOVs

`GET https://api.dopex.io/api/v1/ssovs`

Example response:

```
{
    "56": [{
        "type": "call",
        "name": "BNB",
        "chainId": 56,
        "underlyingDecimals": 8,
        "totalEpochDeposits": "2643386215653",
        "apy": 0.51,
        "tvl": "233162.44467339824577091596",
        "currentEpoch": 2,
        "epochStartDate": "1645914824",
        "epochEndDate": "1648195200",
        "underlyingPrice": 405.68298959
    }],
    "42161": [{
            "type": "call",
            "name": "DPX",
            "chainId": 42161,
            "underlyingDecimals": 18,
            "totalEpochDeposits": "58978535938702383666099",
            "apy": 25.99,
            "tvl": "74385261.91304584805492648375",
            "currentEpoch": 2,
            "epochStartDate": "1645913155",
            "epochEndDate": "1648195200",
            "underlyingPrice": 1259.08995812
        },
        {
            "type": "call",
            "name": "RDPX",
            "chainId": 42161,
            "underlyingDecimals": 18,
            "totalEpochDeposits": "156479365425426090228680",
            "apy": 19.34,
            "tvl": "23358485.27234615851825536192",
            "currentEpoch": 1,
            "epochStartDate": "1645913891",
            "epochEndDate": "1648195200",
            "underlyingPrice": 148.39541578
        }
    ]
}
```

---

## TVL

`GET https://api.dopex.io/api/v1/tvl`

Example response:

```
{"tvl":"385272088.86094545716095555338"}
```

It is possible to get the TVL of only a specific subset of SSOVs using include

Example request for a specific set of SSOVs:

`https://api.dopex.io/api/v1/tvl?include=dpx-ssov,eth-ssov`

Example response:

```
{"tvl":"36853266.39998449803538870884"}
```

_Please note TVL includes both premium and deposits_

---

## Deposits per strike price <a name="depositsperstrike"></a>

`GET https://api.dopex.io/api/v1/ssov/deposits?asset=DPX&type=CALL`

Example response:

```
{
    "deposits": {
        "1700": {
            "amount": "184.47894697001525027",
            "usd": "356472.3588090998684017264"
        },
        "2000": {
            "amount": "1045.40703925883889822",
            "usd": "2020060.9301006395798084704"
        },
        "2500": {
            "amount": "1029.552413371548508863",
            "usd": "1989424.71940611061464615216"
        },
        "3333": {
            "amount": "4956.786392772684006099",
            "usd": "9578097.48248251275866521968"
        }
    }
}
```

---

## Options prices <a name="optionsprices"></a>

`GET https://api.dopex.io/api/v1/ssov/options/prices?asset=DPX&type=CALL`

Example response:

```
    {
    "deposits": {
        "55": {
            "premium": "0.616098743521431853",
            "fees": "0.0025",
            "total": "0.618598743521431853",
            "usd": "88.18125088898011064515"
        },
        "66": {
            "premium": "0.539398787875357546",
            "fees": "0.0025",
            "total": "0.541898787875357546",
            "usd": "77.2476722116322181823"
        },
        "88": {
            "premium": "0.388395108337086218",
            "fees": "0.0025",
            "total": "0.390895108337086218",
            "usd": "55.7220976934516403759"
        },
        "111": {
            "premium": "0.245858180472895976",
            "fees": "0.0025",
            "total": "0.248358180472895976",
            "usd": "35.4034586264113213788"
        },
        "133": {
            "premium": "0.141268471294736556",
            "fees": "0.0025",
            "total": "0.143768471294736556",
            "usd": "20.4941955830646960578"
        }
    }
}
```

_Please note usd is the equivalent value of total in USD_

---

## Options usage

`GET https://api.dopex.io/api/v1/ssov/options/usage?asset=DPX&type=CALL`

Example response:

```
{
    "total": "4017.5099",
    "strikes": {
        "1700": "184.4789",
        "2000": "1045.391",
        "2500": "1029.546",
        "3333": "1758.094"
    }
}
```

_Please note type must be either CALL or PUT_

---

## APY

`GET https://api.dopex.io/api/v1/ssov/apy?asset=DPX`

Example response:

```
{"apy":41.3}
```

## DPX/rDPX Token price <a name="tokenprice"></a>

`GET https://api.dopex.io/api/v1/{token}/price`

where token is either `dpx` or `rdpx`

Example response:

```
{
  "price": {
    "usd": 118.89,
    "eth": 0.05615177
  }
}
```

## DPX/rDPX Token Supply Information <a name="tokensupply"></a>

`GET https://api.dopex.io/api/v1/{token}/supply`

where token is either `dpx` or `rdpx`

Example response:

```
{
  "totalSupply": 500000,
  "maxSupply": 500000,
  "circulatingSupply": 109255.6242730286
}
```

## DPX/rDPX Market cap <a name="marketcap"></a>

`GET https://api.dopex.io/api/v1/{token}/market-cap`

where token is either `dpx` or `rdpx`

Example response:

```
{
  "marketCap": 13426357.247933285
}
```

## Dopex Farms TVL per pool <a name="dopexfarmstvlperpool"></a>

`GET https://api.dopex.io/api/v1/farms/tvl?pool={pool}`

where pool is for example `dpx-weth`

Example response:

```
{
  "tvl": "3592743.58393229442575691771"
}
```

## Dopex TVL per contract <a name="dopextvlpercontract"></a>

`GET https://api.dopex.io/api/v1/tvl?include=[{contract1},{contract2},...]`

Examples of the `contract` parameter:

`dpx-farm,rdpx-farm,dpx-weth-farm,rdpx-weth-farm,dpx-ssov,rdpx-ssov`

Example request:

`GET https://api.dopex.io/api/v1/tvl?include=dpx-farm,rdpx-farm,dpx-weth-farm,rdpx-weth-farm,dpx-ssov,rdpx-ssov `

Example response:

```
{
  "tvl": "398025406.96416862025293412763"
}
```
