import { config } from 'dotenv'
config({ path: 'apps/api/.env' }) // <-- adjust if your env file is elsewhere

import { PrismaClient, Role } from '@generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/\/\/.*?:.*?@/, "//***:***@"))

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
    const alice = await prisma.user.upsert({
        where: { username: 'alice' },
        update: {}, // or update: { role: Role.ADMIN }
        create: {
          username: 'alice',
          password: 'changeme-alice', // ideally hash this
          role: Role.ADMIN, // must be one of: Role.User | Role.OWNER | Role.ADMIN
        },
      })
    
      const bob = await prisma.user.upsert({
        where: { username: 'bob' },
        update: {},
        create: {
          username: 'bob',
          password: 'changeme-bob',
          role: Role.OWNER,
        },
      })
    
      console.log({ alice, bob })    
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
