import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { poolRoutes } from '../routes/pool'
import { gameRoutes } from '../routes/game'
import { guessRoutes } from '../routes/guess'
import { userRoutes } from '../routes/user'
import { authRoutes } from '../routes/auth'

const bootsStrap = async (): Promise<void> => {
  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors)
  await fastify.register(jwt, {
    secret: process.env.SECRET_KEY as string
  })

  await fastify.register(poolRoutes)
  await fastify.register(gameRoutes)
  await fastify.register(guessRoutes)
  await fastify.register(userRoutes)
  await fastify.register(authRoutes)

  fastify.listen(
    {
      port: Number(process.env.PORT) ?? 3333
    },
    () => {
      console.log(
        `http server listening on port  ${process.env.PORT ?? '3333'}`
      )
    }
  )
};

(async () => {
  await bootsStrap()
})().catch((error) => console.error(error))
