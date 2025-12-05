# 🎨 Temporary Test Frontend

## ✅ FIXED - CORS Issues Resolved! (Dec 5, 2025)

All API endpoints now have CORS headers. The frontend should work perfectly!  
**If you had it open before, do a hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

See `FIXED_ISSUES.md` for details on what was fixed.

## ⚠️ THIS IS FOR TESTING ONLY

This is a simple HTML frontend to verify your badge system works.  
**DO NOT** use this as your final frontend!

---

## 🚀 Quick Start

### 1. Start Next.js Server

```bash
cd ..  # Go to web/ directory
npm run dev
```

Server should start on `http://localhost:3000`

### 2. Open Test Frontend

Open `index.html` in your browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html

# Or just double-click the file
```

---

## 🎯 What You Can Test

### 📊 Stats Tab
- View total artists, holders, badges
- See badge distribution chart
- Verifies: `/api/stats` endpoint

### 🏆 Leaderboard Tab
- See top 10 badge collectors
- Shows total badge counts
- Verifies: `/api/leaderboard` endpoint

### 👤 Profile Tab
- Search any wallet address
- View their badges and artists
- Verifies: `/api/profile/[address]/*` endpoints

**Pre-filled test address:**
```
0xmuselover1234567890123456789012345678901
```
(This user has 17 badges in test data)

### 🎨 Artist Tab
- Search by artist ID
- View all supporters and their badges
- Verifies: `/api/artists/[artistId]/supporters` endpoint

**Pre-filled test ID:**
```
100
```
(Test Artist with 9 supporters)

### 🧪 Test Data Tab
- Lists all available test addresses
- Lists all test artist IDs
- Quick action buttons

---

## ✅ Verification Checklist

Your system is working if:

- [x] Stats tab shows numbers (not "-")
- [x] Badge distribution shows 4-5 badge types
- [x] Leaderboard shows users with badge counts
- [x] Profile search returns badges
- [x] Artist search returns supporters
- [x] No errors in browser console

---

## 🐛 Troubleshooting

### "Error loading stats"

**Problem:** Next.js server not running

**Solution:**
```bash
cd ..
npm run dev
```

### CORS Error

**Problem:** Browser blocking requests

**Solution:** Already handled - Next.js API routes don't have CORS issues when served from same origin

### No Data Showing

**Problem:** Database is empty

**Solution:**
```bash
cd ..
npm run badge:test  # Populate with test data
```

Then refresh the page.

---

## 📸 What You Should See

### Stats Page
```
10 Artists
18 Holders
33 Badges Awarded
11 Badge Collectors

Badge Distribution:
- Promethean Backer: 14 awarded
- Titan of Support: 17 awarded
- Nereid Navigator: 1 awarded
- Muse Wanderer: 1 awarded
```

### Leaderboard
```
#1 0xmuselover... 17 🏆
#2 0xpromethean... 2 🏆
#3 0xpromethean... 2 🏆
...
```

### Profile (0xmuselover...)
```
Supporting 8 artists • 17 badges earned

Artists: Pop, Rap, Rock, Jazz, EDM, Country, Indie, Classical
Badges: Muse Wanderer, Promethean Backer (8x), Titan of Support (8x)
```

---

## 🎯 Testing Workflow

1. **Open index.html** in browser
2. **Check Stats tab** - Should show data
3. **Check Leaderboard** - Should show top users
4. **Test Profile Search** - Try different addresses
5. **Test Artist Search** - Try different IDs
6. **Check Browser Console** - Should be no errors

---

## 🔗 API Endpoints Being Tested

All requests go to `http://localhost:3000/api/*`

- ✅ GET `/api/stats`
- ✅ GET `/api/leaderboard?limit=10`
- ✅ GET `/api/profile/[address]/badges`
- ✅ GET `/api/profile/[address]`
- ✅ GET `/api/artists/[artistId]/supporters`

---

## 📁 Files

```
temp-frontend/
├── index.html    - Main test frontend
└── README.md     - This file
```

---

## 🚀 Next Steps

Once verified:

1. **Build real frontend** in the main app
2. **Delete this folder** (it's temporary!)
3. **Use proper React components**
4. **Add your design system**
5. **Deploy to production**

---

## ⚠️ Important Notes

- This is **NOT** production code
- This is **ONLY** for testing the backend
- **DELETE** this folder when done testing
- Build your real frontend in `app/` directory
- Use proper React/Next.js components

---

## ✅ Success Criteria

Your backend is working if:

✅ All tabs load without errors
✅ Stats show real numbers
✅ Leaderboard populates
✅ Profile search returns badges
✅ Artist search returns supporters
✅ Browser console has no errors

**If all above pass → Your backend is ready!** 🎉

Now build your real frontend!

---

**Remember: This is temporary! Delete it after testing!** ⚠️

