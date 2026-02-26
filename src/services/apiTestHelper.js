/**
 * API Test Helper – Run in browser console
 */
import footballDataService from './footballDataService.js';

export async function testAllLeaguesAPI() {
    console.clear();
    console.log('%c🧪 Testing MyFootball API (TheSportsDB)', 'font-size: 16px; font-weight: bold; color: #0066cc;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0066cc;');

    const apiTest = await footballDataService.testAPI();
    console.table(apiTest);

    console.log('\n2️⃣  Testing All 5 Leagues Standings...');
    const leaguesResult = await footballDataService.getAllLeaguesStandings();

    console.log('\n✅ Standings Retrieved:');
    for (const [leagueId, leagueData] of Object.entries(leaguesResult.standings)) {
        if (leagueData.data.response && leagueData.data.response[0]?.standings[0]?.table) {
            const teams = leagueData.data.response[0].standings[0].table;
            console.log(`   ${leagueData.name}: ${teams.length} teams`);
            console.log(`      🥇 ${teams[0].team.name} (${teams[0].points} pts)`);
        }
    }

    if (leaguesResult.errors.length > 0) {
        console.error('\n❌ Errors occurred:');
        console.table(leaguesResult.errors);
    }

    console.log('\n3️⃣  Individual League Test (Premier League)...');
    try {
        const pl = await footballDataService.getLeagueStandings(39);
        const teams = pl.response[0].standings[0].table;
        console.log(`✅ Premier League: ${teams.length} teams`);
        console.table(teams.slice(0, 5).map(t => ({
            Position: t.rank,
            Team: t.team.name,
            Points: t.points,
            Played: t.all.played
        })));
    } catch (error) {
        console.error('❌ Premier League test failed:', error);
    }

    console.log('\n✨ Test Complete!');
}

export default { testAllLeaguesAPI };