const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quantumhub.com' },
    update: {},
    create: {
      email: 'admin@quantumhub.com',
      name: 'Admin User',
      hashedPassword: adminPassword,
      role: 'ADMIN',
      status: 'Active',
      balance: 1000,
      pricingTier: 'standard'
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