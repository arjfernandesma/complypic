import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

function makeStub(): Redis {
  return new Proxy({} as Redis, {
    get() {
      return async () => null
    },
  })
}

export const redis: Redis = url && token ? new Redis({ url, token }) : makeStub()
