import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Upsert admin user
  const adminPassword = await hash('Admin@123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@quantum.com' },
    update: { 
      hashedPassword: adminPassword,
      role: 'ADMIN',
      status: 'Active'
    },
    create: {
      email: 'admin@quantum.com',
      name: 'ADMIN',
      hashedPassword: adminPassword,
      role: 'ADMIN',
      status: 'Active'
    }
  })

  // Upsert client user
  const clientPassword = await hash('admin1', 12)
  await prisma.user.upsert({
    where: { email: 'marketingpros178@gmail.com' },
    update: { 
      hashedPassword: clientPassword,
      role: 'CLIENT',
      status: 'Active'
    },
    create: {
      email: 'marketingpros178@gmail.com',
      name: 'Marco Garcia',
      hashedPassword: clientPassword,
      role: 'CLIENT',
      status: 'Active'
    }
  })

  console.log('Users created/updated successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 