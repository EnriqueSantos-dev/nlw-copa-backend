/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PrismaClient } from '@prisma/client'

export default class Prisma {
  public static prisma: PrismaClient | null = null

  static getInstance (): PrismaClient {
    if (this.prisma === null) {
      this.prisma = new PrismaClient()
    }

    return this.prisma
  }
}

export const prisma = Prisma.getInstance()
