import { VerifyPayloadType } from '@fastify/jwt'
import { FastifyRequest } from 'fastify'

export async function authenticate (fastify: FastifyRequest): Promise<VerifyPayloadType> {
  return await fastify.jwtVerify()
}
