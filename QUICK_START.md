# 🚀 Quick Start Guide - MyFootball API

## Installation

The API service is already configured and ready to use!

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Verify It's Working

Open your browser console (F12) and run:

```javascript
// Check if API is connected
import footballDataService from '/src/services/footballDataService.js'
await footballDataService.testAPI()
```

You should see:
```
✅ [API] API connection successful!
✅ [API] Retrieved standings with 20 teams
```

---

## 🎯 Basic Usage

### Get League Standings (Specific League)

```javascript
// Premier League
const standings = await footballDataService.getLeagueStandings(39)

// Access the data
const table = standings.response[0].standings[0].table
console.log(`Top team: ${table[0].team.name}`)
console.log(`Points: ${table[0].points}`)
```

### Get All 5 Leagues at Once

```javascript
const result = await footballDataService.getAllLeaguesStandings()

// Access the standings
result.standings[39]    // Premier League
result.standings[140]   // La Liga
result.standings[78]    // Bundesliga
result.standings[61]    // Ligue 1
result.standings[135]   // Serie A
```

### Get Top Scorers

```javascript
const scorers = await footballDataService.getTopScorers(39)
console.log(scorers.response)  // Array of top scorers
```

### Get Today's Matches

```javascript
const matches = await footballDataService.getTodayFixtures(39)
console.log(matches.response)  // Array of today's matches
```

---

## 📊 League IDs Reference

| League | ID | Country |
|--------|----|---------| 
| Premier League | 39 | England |
| La Liga | 140 | Spain |
| Bundesliga | 78 | Germany |
| Ligue 1 | 61 | France |
| Serie A | 135 | Italy |

---

## 🧪 Testing Your API

### Visual Test Page
If you add the test component to your router:
```jsx
import APITest from './pages/APITest'

// In your router
<Route path="/api-test" element={<APITest />} />
```

Then visit: `http://localhost:5173/api-test`

Click "Run Full API Test" and watch it verify all 5 leagues!

### Console Test Script

```javascript
// Comprehensive test in console
async function testFootballAPI() {
  const service = footballDataService
  
  // Test 1: Connectivity
  console.log('1️⃣  Testing API...')
  const test = await service.testAPI()
  console.table(test)
  
  // Test 2: Specific league
  console.log('2️⃣  Testing Premier League...')
  const pl = await service.getLeagueStandings(39)
  const plTeams = pl.response[0].standings[0].table
  console.log(`Premier League: ${plTeams.length} teams`)
  console.table(plTeams.slice(0, 3).map(t => ({
    Position: t.rank,
    Team: t.team.name,
    Points: t.points,
    Played: t.all.played
  })))
  
  // Test 3: All leagues
  console.log('3️⃣  Testing All 5 Leagues...')
  const allLeagues = await service.getAllLeaguesStandings()
  console.log(`✅ Retrieved standings for ${Object.keys(allLeagues.standings).length} leagues`)
}

await testFootballAPI()
```

---

## 📈 Data Structure Example

```javascript
// League Standing Object
{
  rank: 1,                    // Position in league
  team: {
    id: 33,
    name: "Manchester City",
    logo: "https://..."
  },
  points: 90,                 // Total points
  goalsDiff: 60,              // Goal difference
  form: "DWWWW",              // Last 5 results
  status: "same",             // Position change
  all: {
    played: 30,               // Matches played
    win: 27,
    draw: 9,
    lose: 6,
    goals: {
      for: 85,                // Goals scored
      against: 25             // Goals conceded
    }
  }
}
```

---

## 🔍 Debugging

### See Detailed Logs
Open DevTools Console (F12) and filter for `[API]`:
```javascript
// All API logs will show like this:
[API] Fetching standings for league 39, season 2024
[API] ✅ Successfully fetched standings for league 39
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter for `standings` endpoints
4. Check request headers and response data

### Common Errors & Fixes

**"API test failed: 401"**
- API key invalid
- Fix: Get new key from https://www.api-football.com/

**"No data available"**
- Season not available
- Fix: Try 2024 or 2023

**"Timeout Error"**
- Network too slow
- Fix: Check internet connection

---

## 💡 Pro Tips

1. **Cache Results**: Store standings in state to avoid repeated API calls
2. **Error Handling**: Always wrap API calls in try-catch
3. **Loading States**: Show loading spinner while fetching
4. **Timestamps**: Store when data was fetched to refresh periodically
5. **Season Management**: Season parameter defaults to 2024, update annually

---

## 📱 Integration Example

Here's how to integrate in a React component:

```jsx
import { useState, useEffect } from 'react'
import footballDataService from '../services/footballDataService'

function LeagueTable({ leagueId }) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true)
        const response = await footballDataService.getLeagueStandings(leagueId)
        const table = response.response[0].standings[0].table
        setStandings(table)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [leagueId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <table>
      <thead>
        <tr>
          <th>Position</th>
          <th>Team</th>
          <th>Points</th>
          <th>Played</th>
        </tr>
      </thead>
      <tbody>
        {standings.map(team => (
          <tr key={team.team.id}>
            <td>{team.rank}</td>
            <td>{team.team.name}</td>
            <td>{team.points}</td>
            <td>{team.all.played}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default LeagueTable
```

---

## 🎓 What's Included

✅ Automatic retry logic (up to 3 attempts)
✅ Detailed error handling
✅ Request timeouts (10 seconds)
✅ Console logging with `[API]` prefix
✅ All 5 leagues pre-configured
✅ Helper methods for batch operations
✅ Test functions for verification

---

## ❓ Need Help?

1. Check the console for `[API]` logs
2. Read `API_SETUP.md` for detailed configuration
3. Check `API_IMPLEMENTATION_REPORT.md` for complete documentation
4. Verify API key is valid at https://www.api-football.com/

---

**Ready to go! 🚀**

Start fetching league data now!
