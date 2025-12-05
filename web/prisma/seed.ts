import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const badges = [
    {
      badgeId: 'PROMETHEAN_BACKER',
      displayName: 'Promethean Backer',
      description: 'First 5 holders of an artist.',
    },
    {
      badgeId: 'ORACLE_OF_RISES',
      displayName: 'Oracle of Rises',
      description: 'Early holder in artists that later reach 200+ holders.',
    },
    {
      badgeId: 'NEREID_NAVIGATOR',
      displayName: 'Nereid Navigator',
      description: 'Bought during a 15%+ price dip.',
    },
    {
      badgeId: 'MUSE_WANDERER',
      displayName: 'Muse Wanderer',
      description: 'Supports artists across 8+ genres.',
    },
    {
      badgeId: 'TITAN_OF_SUPPORT',
      displayName: 'Titan of Support',
      description: "Acquired at least 1% of an artist's supply in one buy.",
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { badgeId: badge.badgeId },
      update: {},
      create: badge,
    })
    console.log(`✅ Created badge: ${badge.displayName}`)
  }

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

