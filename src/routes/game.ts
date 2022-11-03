import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function gameRoutes (fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/games/count', {
    onRequest: [authenticate]
  }, async (_, reply) => {
    try {
      const lengthGuesses = await prisma.guess.count()

      return await reply.code(200).send({ count: lengthGuesses })
    } catch (error) {
      console.log(error)
      return await reply.code(500).send('Internal Server Error')
    }
  })

  fastify.get('/api/v1/pools/:id/games', {
    onRequest: [authenticate]
  }, async (req) => {
    const getPoolParams = z.object({
      id: z.string().min(6)
    })

    const { id } = getPoolParams.parse(req.params)

    const games = await prisma.game.findMany({
      orderBy: {
        data: 'desc'
      },
      include: {
        guesses: {
          where: {
            particapant: {
              userId: req.user.sub,
              poolId: id
            }
          }
        }
      }
    })

    return {
      games: games.map((game) => ({
        ...game,
        guess: game.guesses.length > 0 ? game.guesses[0] : null,
        guesses: undefined
      }))
    }
  })
}
