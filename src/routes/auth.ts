import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function authRoutes (fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/me', {
    onRequest: [authenticate]
  }, async (request) => {
    return { user: request.user }
  })

  fastify.post('/api/v1/users', async (request) => {
    const createUserBody = z.object({
      access_token: z.string()
    })

    const { access_token: accessToken } = createUserBody.parse(request.body)

    const userResponse = await fetch(process.env.GOOGLE_URL as string, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    const userData = await userResponse.json()

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url()
    })

    const userInfo = userInfoSchema.parse(userData)

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture
        }
      })
    }

    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: 60 * 60 * 24 * 3 // 2 days
    })

    return { token }
  })
}
