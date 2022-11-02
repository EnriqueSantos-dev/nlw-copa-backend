/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PrismaClient } from '@prisma/client'

export default abstract class Prisma {
  public static prisma: PrismaClient

  static get (): PrismaClient {
    if (this.prisma === null) {
      this.prisma = new PrismaClient()
    }

    return this.prisma
  }
}
