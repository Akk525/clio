# Testing Scripts

Quick reference for database testing and verification scripts.

## 📜 Available Scripts

### npm run commands (from web/ directory)

| Command | Description |
|---------|-------------|
| `npm run db:test` | Run comprehensive database tests (10 test scenarios) |
| `npm run db:inspect` | Quick inspection of current database state |
| `npm run db:clear` | Clear test data (keeps badges and Global artist) |
| `npm run prisma:studio` | Open Prisma Studio GUI at http://localhost:5555 |
| `npm run prisma:seed` | Seed badges and Global artist |
| `npm run prisma:migrate` | Create and apply database migrations |
| `npm run prisma:generate` | Regenerate Prisma Client |

### Direct npx commands

```bash
# Run individual scripts
npx tsx scripts/test-db.ts
npx tsx scripts/inspect-db.ts
npx tsx scripts/clear-test-data.ts

# Prisma commands
npx prisma studio
npx prisma migrate dev --name your_migration_name
npx prisma db seed
```

## 🎯 Common Workflows

### Testing After Schema Changes

```bash
npm run prisma:generate  # Regenerate client
npm run db:test          # Run all tests
npm run prisma:studio    # Visual inspection
```

### Starting Fresh

```bash
rm prisma/dev.db         # Delete database
npm run prisma:migrate   # Recreate and seed
npm run db:test          # Verify everything works
```

### Daily Development

```bash
npm run db:inspect       # Quick check
npm run prisma:studio    # Visual inspection (keep open)
```

### Before Committing

```bash
npm run db:clear         # Clear test data
npm run db:test          # Run fresh tests
```

## 📊 What Each Script Does

### `test-db.ts` (Comprehensive)
- ✅ Tests all 5 models
- ✅ Tests relationships
- ✅ Tests queries (simple & complex)
- ✅ Creates sample data
- ✅ Verifies foreign keys
- ✅ Tests badge awarding logic

**Run when:** After schema changes, before deploying

### `inspect-db.ts` (Quick Check)
- 📋 Lists all badges
- 🎨 Shows all artists with counts
- 👥 Lists all holders
- 📊 Shows recent stats
- 🏆 Shows awarded badges by user
- 📈 Summary statistics

**Run when:** Quick sanity check needed

### `clear-test-data.ts` (Cleanup)
- 🧹 Removes all user badges
- 🧹 Removes all artist stats
- 🧹 Removes all artist holders
- 🧹 Removes all artists (except Global)
- ✅ Keeps Badge table intact
- ✅ Keeps Global placeholder artist

**Run when:** Need clean slate for new tests

## 🔧 Example Usage

```bash
# 1. Initial setup (already done)
cd web
npm install
npm run prisma:migrate

# 2. Test everything works
npm run db:test

# 3. Visual inspection
npm run prisma:studio
# Browse to http://localhost:5555

# 4. Check current state
npm run db:inspect

# 5. Clear and test again
npm run db:clear
npm run db:test

# 6. Inspect final state
npm run db:inspect
```

## 🎨 Prisma Studio Tips

When using `npm run prisma:studio`:

1. **Browse tables** - Click on any model in the sidebar
2. **Add records** - Click "Add record" button
3. **Edit inline** - Double-click any cell
4. **Filter** - Use the filter bar at the top
5. **Follow relationships** - Click the relationship icon (chain link)
6. **Delete** - Select rows and click delete

## 📝 Creating Custom Test Scripts

```typescript
// my-custom-test.ts
import { prisma } from '../lib/prisma'

async function main() {
  // Your test logic here
  const artists = await prisma.artist.findMany()
  console.log('Artists:', artists.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run with:
```bash
npx tsx scripts/my-custom-test.ts
```

## 🚨 Troubleshooting

### "Foreign key constraint violated"
- Make sure Global artist (ID: 0) exists
- Run `npm run prisma:seed`

### "Table doesn't exist"
- Run `npm run prisma:migrate`

### "PrismaClient not found"
- Run `npm run prisma:generate`

### Prisma Studio won't open
- Check if port 5555 is already in use
- Kill existing Prisma Studio: `pkill -f "prisma studio"`

## 📚 Related Files

- `prisma/schema.prisma` - Database schema
- `lib/prisma.ts` - Prisma Client singleton
- `prisma/seed.ts` - Seed script
- `TESTING_WORKFLOW.md` - Detailed testing guide

