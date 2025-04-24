import { hash } from "bcryptjs"
import { prisma } from "../lib/prisma"

async function main() {
  const email = "admin@quantum.com"
  const password = "Admin@123"
  
  try {
    const hashedPassword = await hash(password, 12)
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        hashedPassword,
        role: "ADMIN",
        name: "System Admin"
      },
      create: {
        email,
        hashedPassword,
        role: "ADMIN",
        name: "System Admin"
      }
    })

    console.log("Admin user created:", {
      email: user.email,
      role: user.role
    })
    
    console.log("\nYou can now log in with:")
    console.log("Email:", email)
    console.log("Password:", password)
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 