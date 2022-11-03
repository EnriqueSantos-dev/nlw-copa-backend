import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function userRoutes (fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/users/count', async (_, reply) => {
    try {
      const lengthUsers = await prisma.user.count()

      return await reply.code(200).send({ count: lengthUsers })
    } catch (error) {
      console.log(error)

      return await reply.code(500).send('Internal Server Error')
    }
  })
}
