# Dopex REST API

Built with Vercel's serverless functions.

Read more here - https://vercel.com/docs/serverless-functions/introduction

**TVL**

Endpoint: https://api.dopex.io/api/v1/tvl

Method: GET

Example response:
`{"tvl":"385272088.86094545716095555338"}`

It is possible to get the TVL of only a specific subset of SSOVs using include

Example request:
https://api.dopex.io/api/v1/tvl?include=dpx-ssov,eth-ssov

Example response:
`{"tvl":"36853266.39998449803538870884"}`

Please note TVL includes both premium and deposits

------------------------------------------------------------------------------------

**Deposits per strike price**

Endpoint: https://api.dopex.io/api/v1/ssov/deposits?asset=DPX

Method: GET

Example response:
`{"deposits":{"1700":{"amount":"184.47894697001525027","usd":"356472.3588090998684017264"},"2000":{"amount":"1045.40703925883889822","usd":"2020060.9301006395798084704"},"2500":{"amount":"1029.552413371548508863","usd":"1989424.71940611061464615216"},"3333":{"amount":"4956.786392772684006099","usd":"9578097.48248251275866521968"}}}`

-------------------------------------------------------------------------------------------

**Options prices**

Endpoint: https://api.dopex.io/api/v1/ssov/options/prices?asset=DPX

Method: GET

Example response:
`{"deposits":{"55":{"premium":"0.616098743521431853","fees":"0.0025","total":"0.618598743521431853","usd":"88.18125088898011064515"},"66":{"premium":"0.539398787875357546","fees":"0.0025","total":"0.541898787875357546","usd":"77.2476722116322181823"},"88":{"premium":"0.388395108337086218","fees":"0.0025","total":"0.390895108337086218","usd":"55.7220976934516403759"},"111":{"premium":"0.245858180472895976","fees":"0.0025","total":"0.248358180472895976","usd":"35.4034586264113213788"},"133":{"premium":"0.141268471294736556","fees":"0.0025","total":"0.143768471294736556","usd":"20.4941955830646960578"}}}`

Please note usd is the equivalent value of total in USD

----------------------------------------------------------------------------------------------------------

**Options usage**

Endpoint: https://api.dopex.io/api/v1/ssov/options/usage?asset=DPX

Method: GET

Example response:
`{"total":"4017.5099","strikes":{"1700":"184.4789","2000":"1045.391","2500":"1029.546","3333":"1758.094"}}`

----------------------------------------------------------------------------------------------------------

**APY**

Endpoint: https://api.dopex.io/api/v1/ssov/apy?asset=DPX

Method: GET

Example response: 
`{"apy":41.3}`