/**
 * Test Frontend API Endpoints
 * 
 * Quick test to verify all endpoints the frontend needs are working
 * Run with: npx tsx scripts/test-frontend-apis.ts
 */

const API_BASE = 'http://localhost:3000/api'

async function testEndpoint(name: string, url: string) {
  try {
    console.log(`\n🧪 Testing: ${name}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   ✅ Data received: ${JSON.stringify(data).substring(0, 100)}...`)
      return true
    } else {
      console.log(`   ❌ Status: ${response.status}`)
      console.log(`   ❌ Error: ${JSON.stringify(data)}`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error}`)
    return false
  }
}

async function main() {
  console.log('\n🔍 Testing Frontend API Endpoints\n')
  console.log('=' .repeat(70))

  const tests = [
    ['Stats', `${API_BASE}/stats`],
    ['Leaderboard', `${API_BASE}/leaderboard?limit=10`],
    ['Profile', `${API_BASE}/profile/0xmuselover1234567890123456789012345678901`],
    ['Profile Badges', `${API_BASE}/profile/0xmuselover1234567890123456789012345678901/badges`],
    ['Artist Supporters', `${API_BASE}/artists/100/supporters`],
  ]

  let passed = 0
  let failed = 0

  for (const [name, url] of tests) {
    const result = await testEndpoint(name, url)
    if (result) {
      passed++
    } else {
      failed++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('\n✅ All endpoints working! Frontend should load correctly.')
    console.log('\n💡 Open temp-frontend/index.html in your browser to test.')
  } else {
    console.log('\n❌ Some endpoints failed. Check the errors above.')
  }
  
  console.log()
}

main().catch(console.error)
