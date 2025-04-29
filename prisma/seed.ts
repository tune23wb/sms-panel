import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quantum.com' },
    update: {},
    create: {
      email: 'admin@quantum.com',
      name: 'Admin User',
      hashedPassword: adminPassword,
      role: 'ADMIN',
      status: 'Active',
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 