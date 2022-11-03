import { FastifyInstance } from 'fastify'
import ShortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function poolRoutes (fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/pools/count', async (_, reply) => {
    try {
      const lengthPools = await prisma.pool.count()
      return await reply.code(200).send({ count: lengthPools })
    } catch (error) {
      return await reply.code(500).send('Internal Server Error')
    }
  })

  fastify.post('/api/v1/pools', async (req, reply) => {
    const schemaCreatePool = z.object({
      title: z
        .string({ required_error: 'O nome é obrigatório para criar o bolão' })
        .min(5, {
          message: 'O nome do bolão precisa ter pelo menos 5 letras'
        })
    })

    const validData = schemaCreatePool.parse(req.body)
    const generateCode = new ShortUniqueId({ length: 6 })
    const code = String(generateCode()).toUpperCase()

    try {
      if (!validData) {
        return await reply.code(400).send({ message: 'Bad Request' })
      }

      await req.jwtVerify()

      await prisma.pool.create({
        select: {
          code: true
        },
        data: {
          title: validData.title,
          code,
          onwerId: req.user.sub,

          particapants: {
            create: {
              userId: req.user.sub
            }
          }
        }
      })

      return await reply.code(201).send(code)
    } catch (error) {
      await prisma.pool.create({
        select: {
          code: true
        },
        data: {
          title: validData.title,
          code
        }
      })

      return { code }
    }
  })

  fastify.post('/api/v1/pools/join', {
    onRequest: [authenticate]
  }, async (req, reply) => {
    const joinPoolSchema = z.object({
      code: z.string().min(6)
    })

    const { code } = joinPoolSchema.parse(req.body)

    const pool = await prisma.pool.findUnique({
      where: { code },
      include: {
        particapants: {
          where: {
            userId: req.user.sub
          }
        }
      }
    })

    if (!pool) return await reply.code(404).send({ message: 'Pool Not Found' })

    if (pool.particapants.length) return await reply.code(400).send({ message: 'User already joined this pool' })

    if (!pool.onwerId) {
      await prisma.pool.update({
        where: { id: pool.id },
        data: { onwerId: req.user.sub }
      })
    }

    await prisma.particapant.create({
      data: {
        poolId: pool.id,
        userId: req.user.sub
      }
    })

    return await reply.code(201).send()
  })

  fastify.get('/api/v1/pools', {
    onRequest: [authenticate]
  }, async (req, reply) => {
    const pools = await prisma.pool.findMany({
      where: {
        particapants: {
          some: {
            userId: req.user.sub
          }
        }
      },
      include: {
        _count: {
          select: {
            particapants: true
          }
        },
        particapants: {
          select: {
            id: true,

            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    return { pools }
  })

  fastify.get('/api/v1/pools/:poolId', {
    onRequest: [authenticate]
  }, async (req, reply) => {
    const getPoolParams = z.object({
      id: z.string().min(6)
    })

    const { id } = getPoolParams.parse(req.params)

    const pool = await prisma.pool.findUnique({
      where: {
        id
      },
      include: {
        _count: {
          select: {
            particapants: true
          }
        },
        particapants: {
          select: {
            id: true,

            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    return { pool }
  })
}
