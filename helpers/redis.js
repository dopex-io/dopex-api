import { Redis } from '@upstash/redis'
import 'isomorphic-fetch'

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
export default redis
