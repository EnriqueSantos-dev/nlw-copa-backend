import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function guessRoutes (fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/guesses/count', async (request, reply) => {
    try {
      const lengthGuesses = await prisma.guess.count()

      return await reply.code(200).send({ count: lengthGuesses })
    } catch (error) {
      console.log(error)
      return await reply.code(500).send('Internal Server Error')
    }
  })

  fastify.post('/api/v1/pools/:poolId/games/:gameId',
    {
      onRequest: [authenticate]
    }, async (req, reply) => {
      const createGuessSchema = z.object({
        poolId: z.string().min(6),
        gameId: z.string()
      })

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number()

      })

      const { gameId, poolId } = createGuessSchema.parse(req.params)
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(req.body)

      const participant = await prisma.particapant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: req.user.sub
          }
        }
      })

      if (!participant) return await reply.code(400).send({ message: 'You not allowed to create a guess inside this pool.' })

      const guess = await prisma.guess.findUnique({
        where: {
          particapantId_gameId: {
            particapantId: participant.id,
            gameId
          }
        }
      })

      if (guess) return await reply.code(200).send({ message: 'You already have a guess in this pool.' })

      const game = await prisma.game.findUnique({
        where: { id: gameId }
      })

      if (!game) return await reply.code(404).send({ message: 'Not Found' })

      if (game.data < new Date()) {
        return await reply.code(400).send({ message: 'You cannot create a guess after this date time has passed.' })
      }

      await prisma.guess.create({
        data: {
          gameId,
          particapantId: participant.id,
          firstTeamPoints,
          secondTeamPoints
        }
      })

      return await reply.code(201).send()
    })
}
