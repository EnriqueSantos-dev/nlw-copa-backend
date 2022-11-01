import 'dotenv/config'
import Fastify from 'fastify'

const bootsStrap = (): void => {
  const fastify = Fastify({
    logger: true
  })

  fastify.listen({
    port: Number(process.env.PORT) ?? 3333
  }, () => {
    console.log(`http server listening on port  ${process.env.PORT ?? '3333'}`)
  })
}

bootsStrap()
