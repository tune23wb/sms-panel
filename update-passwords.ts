import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Update admin password
  const adminPassword = await hash('Admin@123', 12)
  await prisma.user.update({
    where: { email: 'admin@quantum.com' },
    data: { hashedPassword: adminPassword }
  })

  // Update client password
  const clientPassword = await hash('admin1', 12)
  await prisma.user.update({
    where: { email: 'marketingpros178@gmail.com' },
    data: { hashedPassword: clientPassword }
  })

  console.log('Passwords updated successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 