# Dopex API

Built with Vercel's serverless functions.

Read more here - https://vercel.com/docs/serverless-functions/introduction

**SSOVs**

Endpoint: https://api.dopex.io/api/v1/ssovs

Method: GET

Example response:
`{"56":[{"type":"call","name":"BNB","chainId":56,"underlyingDecimals":8,"totalEpochDeposits":"2643386215653","apy":0.51,"tvl":"233162.44467339824577091596","currentEpoch":2,"epochStartDate":"1645914824","epochEndDate":"1648195200","underlyingPrice":405.68298959}],"42161":[{"type":"call","name":"DPX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"58978535938702383666099","apy":25.99,"tvl":"74385261.91304584805492648375","currentEpoch":2,"epochStartDate":"1645913155","epochEndDate":"1648195200","underlyingPrice":1259.08995812},{"type":"call","name":"RDPX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"156479365425426090228680","apy":19.34,"tvl":"23358485.27234615851825536192","currentEpoch":1,"epochStartDate":"1645913891","epochEndDate":"1648195200","underlyingPrice":148.39541578},{"type":"call","name":"ETH","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"9647477785137361526472","apy":16.63,"tvl":"29170878.40352117403405097778","currentEpoch":2,"epochStartDate":"1645914379","epochEndDate":"1648195200","underlyingPrice":3004.18},{"type":"call","name":"GOHM","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"116175845650870624087","apy":804,"tvl":"367094.25380042888226781227","currentEpoch":2,"epochStartDate":"1645914525","epochEndDate":"1648195200","underlyingPrice":3150.96906692},{"type":"call","name":"GMX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"20706437441749027734500","apy":49.63,"tvl":"644540.64001395855994574018","currentEpoch":2,"epochStartDate":"1645914601","epochEndDate":"1648195200","underlyingPrice":30.26493603},{"type":"put","name":"RDPX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"4144037904755578415190000","apy":6.64,"tvl":"4174750.00856053766262961993","currentEpoch":2,"epochStartDate":"1645915064","epochEndDate":"1648195200","underlyingPrice":148.39541578},{"type":"put","name":"ETH","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"418349112991180582808200","apy":6.64,"tvl":"426546.19480069512488392366","currentEpoch":2,"epochStartDate":"1645915172","epochEndDate":"1648195200","underlyingPrice":3004.18},{"type":"put","name":"GOHM","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"50990050000000000000000","apy":6.64,"tvl":"51741.85830283011881009355","currentEpoch":2,"epochStartDate":"1645915350","epochEndDate":"1648195200","underlyingPrice":3150.96906692},{"type":"put","name":"GMX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"30990000000000000000000","apy":6.64,"tvl":"31255.69301942098037194631","currentEpoch":2,"epochStartDate":"1645915409","epochEndDate":"1648195200","underlyingPrice":30.26493603},{"type":"put","name":"BTC","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"75336763880000000000000","apy":6.64,"tvl":"76120.37258656965451992192","currentEpoch":2,"epochStartDate":"1645915409","epochEndDate":"1648195200","underlyingPrice":42629.417},{"type":"put","name":"CRV","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"40392369999999999000000","apy":6.64,"tvl":"40920.43932610382761411211","currentEpoch":2,"epochStartDate":"1645915585","epochEndDate":"1648195200","underlyingPrice":2.29802173},{"type":"put","name":"DPX","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"49741166190466079780000","apy":6.64,"tvl":"51309.36679192170361815345","currentEpoch":1,"epochStartDate":"1645914877","epochEndDate":"1648195200","underlyingPrice":1259.08995812},{"type":"put","name":"LUNA","chainId":42161,"underlyingDecimals":18,"totalEpochDeposits":"74771500000000000000000","apy":6.64,"tvl":"75201.58237626770770694152","currentEpoch":1,"epochStartDate":"1646181305","epochEndDate":"1648195200","underlyingPrice":92.78646389}],"43114":[{"type":"call","name":"AVAX","chainId":43114,"underlyingDecimals":18,"totalEpochDeposits":"1955965750000000000000","apy":"7.49","tvl":"176716.97719333433174986873","currentEpoch":2,"epochStartDate":"1645914727","epochEndDate":"1648195200","underlyingPrice":86.36252648}]}`

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

---

**Deposits per strike price**

Endpoint: https://api.dopex.io/api/v1/ssov/deposits?asset=DPX&type=CALL

Method: GET

Example response:
`{"deposits":{"1700":{"amount":"184.47894697001525027","usd":"356472.3588090998684017264"},"2000":{"amount":"1045.40703925883889822","usd":"2020060.9301006395798084704"},"2500":{"amount":"1029.552413371548508863","usd":"1989424.71940611061464615216"},"3333":{"amount":"4956.786392772684006099","usd":"9578097.48248251275866521968"}}}`

---

**Options prices**

Endpoint: https://api.dopex.io/api/v1/ssov/options/prices?asset=DPX&type=CALL

Method: GET

Example response:
`{"deposits":{"55":{"premium":"0.616098743521431853","fees":"0.0025","total":"0.618598743521431853","usd":"88.18125088898011064515"},"66":{"premium":"0.539398787875357546","fees":"0.0025","total":"0.541898787875357546","usd":"77.2476722116322181823"},"88":{"premium":"0.388395108337086218","fees":"0.0025","total":"0.390895108337086218","usd":"55.7220976934516403759"},"111":{"premium":"0.245858180472895976","fees":"0.0025","total":"0.248358180472895976","usd":"35.4034586264113213788"},"133":{"premium":"0.141268471294736556","fees":"0.0025","total":"0.143768471294736556","usd":"20.4941955830646960578"}}}`

Please note usd is the equivalent value of total in USD

---

**Options usage**

Endpoint: https://api.dopex.io/api/v1/ssov/options/usage?asset=DPX&type=CALL

Method: GET

Example response:
`{"total":"4017.5099","strikes":{"1700":"184.4789","2000":"1045.391","2500":"1029.546","3333":"1758.094"}}`

Please note type must be either CALL or PUT
---

**APY**

Endpoint: https://api.dopex.io/api/v1/ssov/apy?asset=DPX

Method: GET

Example response:
`{"apy":41.3}`
