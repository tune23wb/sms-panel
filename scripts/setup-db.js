const { execSync } = require('child_process')
const path = require('path')

// Run Prisma migrations
console.log('Running database migrations...')
execSync('npx prisma migrate deploy', { stdio: 'inherit' })

// Generate Prisma client
console.log('Generating Prisma client...')
execSync('npx prisma generate', { stdio: 'inherit' })

// Seed the database
console.log('Seeding the database...')
execSync('node prisma/seed.js', { stdio: 'inherit' })

console.log('Database setup completed successfully!') 