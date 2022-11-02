import 'dotenv/config'
import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import Prisma from './factories/prisma-client'
import ShortUniqueId from 'short-unique-id'

const prisma = Prisma.getInstance()

const bootsStrap = (): void => {
  const fastify = Fastify({
    logger: true
  })

  fastify.get('/users/count', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lengthUsers = await prisma.user.count()

      return await reply.code(200).send({ count: lengthUsers })
    } catch (error) {
      return await reply.code(500).send('Internal Server Error')
    }
  })

  fastify.get('/pools/count', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const pools = await prisma.pool.count()

      return await reply.code(200).send({ count: pools })
    } catch (error) {
      return await reply.code(500).send('Internal Server Error')
    }
  })

  fastify.post('/pools', async (request: FastifyRequest, reply: FastifyReply) => {
    const schemaCreatePool = z.object({
      title: z.string({ required_error: 'O nome é obrigatório para criar o bolão' }).min(5, {
        message: 'O nome do bolão precisa ter pelo menos 5 letras'
      })
    })

    try {
      const requestValidated = schemaCreatePool.safeParse(request.body)

      if (!requestValidated.success) {
        return await reply.code(400).send(requestValidated.error.format())
      }

      const generateCode = new ShortUniqueId({ length: 6 })

      const code = await prisma.pool.create({
        select: {
          code: true
        },
        data: {
          title: requestValidated.data.title,
          code: String(generateCode()).toUpperCase()
        }
      })
      return await reply.code(201).send(code)
    } catch (error) {
      return await reply.code(500).send('Internal server error')
    }
  })

  fastify.listen({
    port: Number(process.env.PORT) ?? 3333
  }, () => {
    console.log(`http server listening on port  ${process.env.PORT ?? '3333'}`)
  })
}

bootsStrap()
