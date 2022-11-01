import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main (): Promise<void> {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatarUrl: 'https://github.com/EnriqueSantos-dev.png'
    }
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'example pool',
      code: 'boll123',
      onwerId: user.id,
      particapants: {
        create: { userId: user.id }
      }
    }
  })

  await prisma.game.create({
    data: {
      data: '2022-11-02T14:30:00Z',
      firstTeamCountryCode: 'FR',
      secondTeamCountryCode: 'BR'
    }
  })

  await prisma.game.create({
    data: {
      data: '2022-11-02T17:00:00Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',

      guesses: {
        create: {
          firstTeamPoints: 1,
          secondTeamPoints: 7,
          particapant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id
              }
            }
          }
        }
      }
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect
    console.log('success seed')
  }).catch(async (error) => {
    await prisma.$disconnect
    console.error(error)
    process.exit(1)
  })
