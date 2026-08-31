import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.response.deleteMany({
    where: {
      offeringSessionId: 'cmsysrsvn0005zkv44bf8h8r4'
    }
  })
  console.log('Deleted test responses')
}
main().catch(console.error).finally(() => prisma.$disconnect())
