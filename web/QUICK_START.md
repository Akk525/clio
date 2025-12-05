# ⚡ Quick Start - Clio Social Layer

## One-Command Setup

```bash
cd web
./setup.sh
```

That's it! The script will:
1. ✅ Check prerequisites
2. ✅ Install dependencies
3. ✅ Create database
4. ✅ Seed badges
5. ✅ Run tests
6. ✅ Verify everything works

---

## Manual Setup (3 commands)

```bash
cd web
npm install
npm run prisma:migrate
npm run badge:test
```

---

## Verify It's Working

```bash
# Open visual database browser
npm run prisma:studio
# Visit http://localhost:5555

# Quick inspection
npm run db:inspect

# Run full tests
npm run badge:test
```

---

## What You Get

✅ **5 Badges Ready:**
- 🏆 Promethean Backer (First 5 holders)
- 🔮 Oracle of Rises (Early holder, artist hits 200+)
- 🌊 Nereid Navigator (Bought during 15%+ dip)
- 🎵 Muse Wanderer (8+ genres supported)
- 💪 Titan of Support (1%+ of supply in one buy)

✅ **Complete Database:**
- SQLite database with all tables
- Proper relationships and constraints
- Test data ready for verification

✅ **Badge Engine:**
- Automatic badge awarding
- Event processing
- Query helpers

✅ **Testing Suite:**
- Comprehensive tests for all badges
- Database inspection tools
- Verification utilities

---

## File Locations

```
web/
├── prisma/dev.db          ← Your SQLite database
├── lib/badgeEngine.ts     ← Badge awarding logic
├── prisma/schema.prisma   ← Database schema
└── scripts/
    ├── test-badge-engine.ts ← Badge tests
    └── inspect-db.ts        ← Quick inspection
```

---

## Common Commands

```bash
# Database
npm run prisma:studio      # Visual browser
npm run db:inspect         # Quick check
npm run db:clear           # Clear test data

# Testing
npm run badge:test         # Test all badges
npm run db:test            # Test database

# Development
npm run dev                # Start Next.js server
npm run build              # Build for production
```

---

## Architecture Overview

```
Smart Contract (Base)
       ↓
   Bought Event
       ↓
  Badge Engine ← You are here!
       ↓
   SQLite DB
```

---

## Next Steps

1. **Review the code:**
   - `lib/badgeEngine.ts` - Main logic
   - `prisma/schema.prisma` - Database structure

2. **Explore the database:**
   ```bash
   npm run prisma:studio
   ```

3. **Read full documentation:**
   - `SETUP_GUIDE.md` - Complete guide
   - `BADGE_ENGINE_README.md` - Technical docs

4. **Integrate with contracts:**
   - Deploy smart contracts
   - Set up event listener
   - Connect badge engine

---

## Troubleshooting

**Tests failing?**
```bash
npm run db:clear
npm run badge:test
```

**Database issues?**
```bash
rm prisma/dev.db
npm run prisma:migrate
```

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Team Setup

**Share this with teammates:**

1. Clone repo
2. Run `cd web && ./setup.sh`
3. Done! ✅

**Or manual setup:**

```bash
git clone <repo-url>
cd clio/web
npm install
npm run prisma:migrate
npm run badge:test
```

That's all they need! 🎉

---

## Success Indicators

You'll know it's working when:

✅ `npm run badge:test` shows "ALL TESTS PASSED"
✅ `npm run prisma:studio` opens at localhost:5555
✅ `npm run db:inspect` shows 5 badges and test data
✅ File `prisma/dev.db` exists (your database)

---

## Help

- Full guide: `SETUP_GUIDE.md`
- Technical docs: `BADGE_ENGINE_README.md`
- Test results: `BADGE_VERIFICATION_REPORT.md`

**Ready to build! 🚀**

