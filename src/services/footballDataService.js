/**
 * footballDataService.js
 * ─────────────────────────────────────────────────────────
 *  Uses TheSportsDB (100 % free, no key needed) for:
 *  • Full standings (all teams)
 *  • Top scorers
 *  • Fixtures by league season (filtered to today / recent)
 *  • Team info + badge images
 *
 *  Falls back to rich mock data when the network call fails.
 * ─────────────────────────────────────────────────────────
 */
import axios from 'axios';

class FootballDataService {
    constructor() {
        this.base   = 'https://www.thesportsdb.com/api/v1/json/3/';
        this.http   = axios.create({ timeout: 12000 });
        this.season = this._season();

        // internal-id → TheSportsDB league id
        this.LEAGUES = {
            39:  { tsdb: 4328, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3d195b', bg: 'linear-gradient(135deg,#3d195b,#5d2a8c)' },
            140: { tsdb: 4335, name: 'La Liga',         country: 'Spain',   flag: '🇪🇸', color: '#ee8707', bg: 'linear-gradient(135deg,#ee8707,#f5a623)' },
            135: { tsdb: 4334, name: 'Serie A',         country: 'Italy',   flag: '🇮🇹', color: '#024494', bg: 'linear-gradient(135deg,#024494,#0369a1)' },
            78:  { tsdb: 4331, name: 'Bundesliga',      country: 'Germany', flag: '🇩🇪', color: '#d20515', bg: 'linear-gradient(135deg,#d20515,#dc2626)' },
            61:  { tsdb: 4332, name: 'Ligue 1',         country: 'France',  flag: '🇫🇷', color: '#003189', bg: 'linear-gradient(135deg,#003189,#1e40af)' },
        };

        // reverse: tsdb id → internal id
        this.REV = Object.fromEntries(
            Object.entries(this.LEAGUES).map(([k, v]) => [v.tsdb, +k])
        );
    }

    /* ─── helpers ─── */
    _season() {
        const y = new Date().getFullYear();
        const m = new Date().getMonth() + 1;
        return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    }

    _today() { return new Date().toISOString().split('T')[0]; }

    _badge(url, name) {
        if (url && !url.includes('placeholder')) return url;
        // Use ui-avatars as reliable badge fallback
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a472a&color=40e0d0&bold=true&size=64`;
    }

    /* ─── transform standings ─── */
    _standings(data) {
        if (!data?.table?.length) return { response: [] };
        const table = data.table.map((row, i) => ({
            rank: +row.intRank || i + 1,
            team: {
                id:   row.idTeam,
                name: row.strTeam,
                logo: this._badge(row.strTeamBadge, row.strTeam),
            },
            points:    +row.intPoints    || 0,
            goalsDiff: +row.intGoalDifference || 0,
            all: {
                played: +row.intPlayed || 0,
                win:    +row.intWin    || 0,
                draw:   +row.intDraw   || 0,
                lose:   +row.intLoss   || 0,
                goals: {
                    for:     +row.intGoalsFor     || 0,
                    against: +row.intGoalsAgainst || 0,
                },
            },
        }));
        return { response: [{ standings: [{ table }] }] };
    }

    /* ─── transform top scorers ─── */
    _scorers(data) {
        if (!data?.player?.length) return { response: [] };
        return {
            response: data.player.map(p => ({
                player: {
                    id:    p.idPlayer,
                    name:  p.strPlayer,
                    photo: p.strThumb || p.strCutout || null,
                    nationality: p.strNationality || '',
                },
                statistics: [{
                    team: {
                        id:   p.idTeam,
                        name: p.strTeam,
                        logo: this._badge(p.strTeamBadge, p.strTeam),
                    },
                    goals: {
                        total:   +p.intGoals   || 0,
                        assists: +p.intAssists || 0,
                    },
                }],
            })),
        };
    }

    /* ─── transform fixtures ─── */
    _fixtures(data) {
        if (!data?.events?.length) return { response: [] };
        return {
            response: data.events.map(e => ({
                fixture: {
                    id:   e.idEvent,
                    date: `${e.dateEvent}T${e.strTime || '00:00:00'}`,
                    status: {
                        short:   this._status(e.strStatus),
                        long:    e.strStatus || 'Unknown',
                        elapsed: null,
                    },
                    venue: { name: e.strVenue || 'Stadium' },
                    round: e.intRound,
                },
                league: {
                    id:   this.REV[+e.idLeague] || 39,
                    name: e.strLeague || '',
                    logo: e.strLeagueBadge || null,
                },
                teams: {
                    home: {
                        id:     e.idHomeTeam,
                        name:   e.strHomeTeam,
                        logo:   this._badge(e.strHomeTeamBadge, e.strHomeTeam),
                        winner: +e.intHomeScore > +e.intAwayScore,
                    },
                    away: {
                        id:     e.idAwayTeam,
                        name:   e.strAwayTeam,
                        logo:   this._badge(e.strAwayTeamBadge, e.strAwayTeam),
                        winner: +e.intAwayScore > +e.intHomeScore,
                    },
                },
                goals: {
                    home: e.intHomeScore != null ? +e.intHomeScore : null,
                    away: e.intAwayScore != null ? +e.intAwayScore : null,
                },
            })),
        };
    }

    _status(s) {
        const map = {
            'Match Finished': 'FT', 'Finished': 'FT',
            'Not Started': 'NS',
            'In Progress': '1H', 'Live': '1H',
            'Half Time': 'HT',
            'Extra Time': 'ET', 'Penalties': 'PEN',
            'Postponed': 'PST', 'Cancelled': 'CANC',
        };
        return map[s] || 'NS';
    }

    /* ─── transform team info ─── */
    _teamInfo(data) {
        if (!data?.teams?.length) return { response: [] };
        const t = data.teams[0];
        return {
            response: [{
                team: {
                    id:      t.idTeam,
                    name:    t.strTeam,
                    country: t.strCountry,
                    founded: t.intFormedYear,
                    logo:    this._badge(t.strTeamBadge || t.strTeamLogo, t.strTeam),
                    description: t.strDescriptionEN || '',
                    website: t.strWebsite || '',
                    stadium: t.strStadium,
                },
                venue: {
                    name:     t.strStadium,
                    capacity: t.intStadiumCapacity,
                    address:  t.strStadiumLocation,
                    image:    t.strStadiumThumb || null,
                },
            }],
        };
    }

    /* ═══════════════════════════════════════════
       PUBLIC API METHODS
    ═══════════════════════════════════════════ */

    /** Full league standings — all teams */
    async getLeagueStandings(leagueId, season = null) {
        const { tsdb } = this.LEAGUES[leagueId] || {};
        if (!tsdb) return { response: [] };
        try {
            const res = await this.http.get(`${this.base}lookuptable.php`, {
                params: { l: tsdb, s: season || this.season },
            });
            return this._standings(res.data);
        } catch {
            return this._mockStandings(leagueId);
        }
    }

    /** Top scorers for a league */
    async getTopScorers(leagueId) {
        const { tsdb } = this.LEAGUES[leagueId] || {};
        if (!tsdb) return { response: [] };
        try {
            const res = await this.http.get(`${this.base}lookuptopscorers.php`, {
                params: { l: tsdb },
            });
            return this._scorers(res.data);
        } catch {
            return this._mockScorers(leagueId);
        }
    }

    /** Fixtures by date (defaults to today). Fetches each league's season events. */
    async getTodayFixtures(leagueId = null) {
        return this.getFixturesByDate(this._today(), leagueId);
    }

    async getFixturesByDate(date, leagueId = null) {
        const leagueIds = leagueId
            ? [leagueId]
            : Object.keys(this.LEAGUES).map(Number);
        try {
            const results = await Promise.allSettled(
                leagueIds.map(id =>
                    this.http.get(`${this.base}eventsseason.php`, {
                        params: { id: this.LEAGUES[id].tsdb, s: this.season },
                    })
                )
            );
            const allEvents = results
                .filter(r => r.status === 'fulfilled' && r.value.data?.events)
                .flatMap(r => r.value.data.events);
            const filtered = allEvents.filter(e => e.dateEvent === date);
            // If nothing today, fallback to recent 3 days
            if (!filtered.length) {
                const recent = [];
                for (let d = 0; d < 4; d++) {
                    const dt = new Date();
                    dt.setDate(dt.getDate() - d);
                    const ds = dt.toISOString().split('T')[0];
                    recent.push(...allEvents.filter(e => e.dateEvent === ds));
                    if (recent.length >= 6) break;
                }
                return this._fixtures({ events: recent.slice(0, 20) });
            }
            return this._fixtures({ events: filtered });
        } catch {
            return this._mockFixtures();
        }
    }

    /** Recent matches for a league (last 15 finished) */
    async getRecentMatches(leagueId) {
        const { tsdb } = this.LEAGUES[leagueId] || {};
        if (!tsdb) return { response: [] };
        try {
            const res = await this.http.get(`${this.base}eventspastleague.php`, {
                params: { id: tsdb },
            });
            return this._fixtures(res.data);
        } catch {
            return { response: [] };
        }
    }

    /** Next matches for a league */
    async getNextMatches(leagueId) {
        const { tsdb } = this.LEAGUES[leagueId] || {};
        if (!tsdb) return { response: [] };
        try {
            const res = await this.http.get(`${this.base}eventsnextleague.php`, {
                params: { id: tsdb },
            });
            return this._fixtures(res.data);
        } catch {
            return { response: [] };
        }
    }

    /** Single fixture detail */
    async getFixtureDetails(fixtureId) {
        try {
            const res = await this.http.get(`${this.base}lookupevent.php`, {
                params: { id: fixtureId },
            });
            return this._fixtures(res.data);
        } catch {
            return { response: [] };
        }
    }

    /** Team info by id */
    async getTeamInfo(teamId) {
        try {
            const res = await this.http.get(`${this.base}lookupteam.php`, {
                params: { id: teamId },
            });
            return this._teamInfo(res.data);
        } catch {
            return { response: [] };
        }
    }

    /** Search team by name */
    async searchTeam(name) {
        try {
            const res = await this.http.get(`${this.base}searchteams.php`, {
                params: { t: name },
            });
            return res.data;
        } catch {
            return { teams: [] };
        }
    }

    /** No event-level data from free tier */
    async getFixtureEvents()     { return { response: [] }; }
    async getFixtureStatistics() { return { response: [] }; }

    /** All leagues standings */
    async getAllLeaguesStandings() {
        const standings = {};
        const errors    = [];
        for (const [id, info] of Object.entries(this.LEAGUES)) {
            try {
                standings[id] = { name: info.name, data: await this.getLeagueStandings(+id) };
            } catch (e) {
                errors.push({ league: info.name, error: e.message });
            }
        }
        return { standings, errors };
    }

    /* ═══════════════════════════════════════════
       MOCK DATA (rich, realistic)
    ═══════════════════════════════════════════ */

    _mockStandings(leagueId) {
        const data = {
            39: [
                { name:'Manchester City',  pts:89, mp:38, w:28, d:5, l:5,  gf:96, ga:45 },
                { name:'Arsenal',          pts:89, mp:38, w:28, d:5, l:5,  gf:91, ga:29 },
                { name:'Liverpool',        pts:82, mp:38, w:25, d:7, l:6,  gf:86, ga:41 },
                { name:'Aston Villa',      pts:78, mp:38, w:24, d:6, l:8,  gf:76, ga:61 },
                { name:'Tottenham',        pts:66, mp:38, w:20, d:6, l:12, gf:74, ga:61 },
                { name:'Chelsea',          pts:60, mp:38, w:18, d:9, l:11, gf:77, ga:63 },
                { name:'Newcastle',        pts:60, mp:38, w:18, d:6, l:14, gf:85, ga:62 },
                { name:'Manchester Utd',   pts:60, mp:38, w:18, d:6, l:14, gf:57, ga:58 },
                { name:'West Ham',         pts:52, mp:38, w:14, d:10, l:14, gf:60, ga:74 },
                { name:'Brighton',         pts:48, mp:38, w:12, d:12, l:14, gf:55, ga:62 },
                { name:'Wolves',           pts:46, mp:38, w:13, d:7, l:18, gf:50, ga:74 },
                { name:'Fulham',           pts:45, mp:38, w:13, d:6, l:19, gf:55, ga:61 },
                { name:'Bournemouth',      pts:44, mp:38, w:13, d:5, l:20, gf:54, ga:65 },
                { name:'Crystal Palace',   pts:39, mp:38, w:10, d:9, l:19, gf:57, ga:58 },
                { name:'Brentford',        pts:39, mp:38, w:10, d:9, l:19, gf:56, ga:65 },
                { name:'Everton',          pts:36, mp:38, w:13, d:9, l:16, gf:40, ga:51 },
                { name:'Nottm Forest',     pts:32, mp:38, w:9, d:5, l:24, gf:49, ga:67 },
                { name:'Luton',            pts:26, mp:38, w:6, d:8, l:24, gf:52, ga:85 },
                { name:'Burnley',          pts:24, mp:38, w:5, d:9, l:24, gf:41, ga:78 },
                { name:'Sheffield Utd',    pts:16, mp:38, w:3, d:7, l:28, gf:35, ga:104 },
            ],
            140: [
                { name:'Real Madrid',   pts:95, mp:38, w:29, d:8, l:1,  gf:87, ga:26 },
                { name:'Barcelona',     pts:85, mp:38, w:26, d:7, l:5,  gf:79, ga:44 },
                { name:'Girona',        pts:81, mp:38, w:25, d:6, l:7,  gf:77, ga:46 },
                { name:'Atletico',      pts:76, mp:38, w:24, d:4, l:10, gf:70, ga:43 },
                { name:'Athletic Club', pts:68, mp:38, w:20, d:8, l:10, gf:61, ga:39 },
                { name:'Real Sociedad', pts:60, mp:38, w:17, d:9, l:12, gf:51, ga:48 },
                { name:'Real Betis',    pts:55, mp:38, w:16, d:7, l:15, gf:50, ga:53 },
                { name:'Valencia',      pts:49, mp:38, w:13, d:10, l:15, gf:45, ga:50 },
                { name:'Villarreal',    pts:48, mp:38, w:14, d:6, l:18, gf:58, ga:60 },
                { name:'Alaves',        pts:47, mp:38, w:14, d:5, l:19, gf:38, ga:64 },
                { name:'Celta Vigo',    pts:45, mp:38, w:13, d:6, l:19, gf:46, ga:60 },
                { name:'Sevilla',       pts:44, mp:38, w:12, d:8, l:18, gf:48, ga:58 },
                { name:'Getafe',        pts:42, mp:38, w:11, d:9, l:18, gf:34, ga:47 },
                { name:'Osasuna',       pts:41, mp:38, w:11, d:8, l:19, gf:40, ga:59 },
                { name:'Las Palmas',    pts:40, mp:38, w:10, d:10, l:18, gf:37, ga:56 },
                { name:'Rayo Vallecano',pts:39, mp:38, w:10, d:9, l:19, gf:40, ga:55 },
                { name:'Mallorca',      pts:39, mp:38, w:9, d:12, l:17, gf:33, ga:49 },
                { name:'Cadiz',         pts:30, mp:38, w:7, d:9, l:22, gf:29, ga:62 },
                { name:'Granada',       pts:22, mp:38, w:5, d:7, l:26, gf:38, ga:84 },
                { name:'Almeria',       pts:21, mp:38, w:5, d:6, l:27, gf:43, ga:98 },
            ],
            135: [
                { name:'Inter Milan',    pts:94, mp:38, w:29, d:7, l:2,  gf:89, ga:22 },
                { name:'AC Milan',       pts:75, mp:38, w:22, d:9, l:7,  gf:76, ga:49 },
                { name:'Juventus',       pts:71, mp:38, w:21, d:8, l:9,  gf:57, ga:36 },
                { name:'Bologna',        pts:68, mp:38, w:20, d:8, l:10, gf:60, ga:44 },
                { name:'Roma',           pts:63, mp:38, w:18, d:9, l:11, gf:65, ga:53 },
                { name:'Lazio',          pts:61, mp:38, w:17, d:10, l:11, gf:63, ga:54 },
                { name:'Fiorentina',     pts:60, mp:38, w:17, d:9, l:12, gf:65, ga:51 },
                { name:'Atalanta',       pts:58, mp:38, w:16, d:10, l:12, gf:67, ga:51 },
                { name:'Napoli',         pts:53, mp:38, w:16, d:5, l:17, gf:56, ga:57 },
                { name:'Torino',         pts:49, mp:38, w:13, d:10, l:15, gf:48, ga:49 },
                { name:'Monza',          pts:44, mp:38, w:12, d:8, l:18, gf:50, ga:63 },
                { name:'Genoa',          pts:44, mp:38, w:11, d:11, l:16, gf:42, ga:58 },
                { name:'Lecce',          pts:41, mp:38, w:10, d:11, l:17, gf:36, ga:58 },
                { name:'Cagliari',       pts:38, mp:38, w:9, d:11, l:18, gf:36, ga:66 },
                { name:'Hellas Verona',  pts:36, mp:38, w:9, d:9, l:20, gf:42, ga:65 },
                { name:'Udinese',        pts:35, mp:38, w:8, d:11, l:19, gf:36, ga:55 },
                { name:'Empoli',         pts:33, mp:38, w:7, d:12, l:19, gf:31, ga:56 },
                { name:'Frosinone',      pts:32, mp:38, w:7, d:11, l:20, gf:46, ga:80 },
                { name:'Sassuolo',       pts:30, mp:38, w:7, d:9, l:22, gf:42, ga:78 },
                { name:'Salernitana',    pts:17, mp:38, w:3, d:8, l:27, gf:30, ga:79 },
            ],
            78: [
                { name:'Bayer Leverkusen', pts:90, mp:34, w:28, d:6, l:0,  gf:89, ga:24 },
                { name:'Bayern Munich',    pts:72, mp:34, w:22, d:6, l:6,  gf:94, ga:45 },
                { name:'Stuttgart',        pts:68, mp:34, w:20, d:8, l:6,  gf:78, ga:39 },
                { name:'RB Leipzig',       pts:65, mp:34, w:19, d:8, l:7,  gf:75, ga:44 },
                { name:'Dortmund',         pts:63, mp:34, w:18, d:9, l:7,  gf:62, ga:38 },
                { name:'Eintracht Frankfurt', pts:55, mp:34, w:16, d:7, l:11, gf:52, ga:46 },
                { name:'Hoffenheim',       pts:53, mp:34, w:15, d:8, l:11, gf:66, ga:58 },
                { name:'Freiburg',         pts:53, mp:34, w:14, d:11, l:9, gf:51, ga:40 },
                { name:'Wolfsburg',        pts:47, mp:34, w:13, d:8, l:13, gf:53, ga:51 },
                { name:'Werder Bremen',    pts:44, mp:34, w:12, d:8, l:14, gf:44, ga:52 },
                { name:'Heidenheim',       pts:42, mp:34, w:11, d:9, l:14, gf:50, ga:62 },
                { name:'Mainz',            pts:41, mp:34, w:11, d:8, l:15, gf:43, ga:54 },
                { name:'Augsburg',         pts:39, mp:34, w:10, d:9, l:15, gf:39, ga:55 },
                { name:'Gladbach',         pts:38, mp:34, w:10, d:8, l:16, gf:60, ga:75 },
                { name:'Union Berlin',     pts:26, mp:34, w:7, d:5, l:22, gf:36, ga:62 },
                { name:'VfL Bochum',       pts:26, mp:34, w:5, d:11, l:18, gf:28, ga:62 },
                { name:'Köln',             pts:25, mp:34, w:6, d:7, l:21, gf:32, ga:68 },
                { name:'Darmstadt',        pts:21, mp:34, w:4, d:9, l:21, gf:28, ga:79 },
            ],
            61: [
                { name:'Paris SG',     pts:83, mp:34, w:26, d:5, l:3,  gf:87, ga:32 },
                { name:'Monaco',       pts:66, mp:34, w:19, d:9, l:6,  gf:70, ga:39 },
                { name:'Brest',        pts:65, mp:34, w:19, d:8, l:7,  gf:56, ga:44 },
                { name:'Lille',        pts:64, mp:34, w:19, d:7, l:8,  gf:59, ga:36 },
                { name:'Nice',         pts:64, mp:34, w:19, d:7, l:8,  gf:55, ga:36 },
                { name:'Lyon',         pts:56, mp:34, w:16, d:8, l:10, gf:57, ga:47 },
                { name:'Marseille',    pts:55, mp:34, w:16, d:7, l:11, gf:54, ga:46 },
                { name:'Lens',         pts:52, mp:34, w:15, d:7, l:12, gf:44, ga:44 },
                { name:'Rennes',       pts:48, mp:34, w:13, d:9, l:12, gf:46, ga:49 },
                { name:'Toulouse',     pts:42, mp:34, w:12, d:6, l:16, gf:41, ga:54 },
                { name:'Strasbourg',   pts:38, mp:34, w:10, d:8, l:16, gf:38, ga:52 },
                { name:'Reims',        pts:37, mp:34, w:9, d:10, l:15, gf:30, ga:42 },
                { name:'Le Havre',     pts:37, mp:34, w:9, d:10, l:15, gf:37, ga:54 },
                { name:'Montpellier',  pts:32, mp:34, w:8, d:8, l:18, gf:38, ga:63 },
                { name:'Nantes',       pts:30, mp:34, w:7, d:9, l:18, gf:27, ga:53 },
                { name:'Metz',         pts:29, mp:34, w:7, d:8, l:19, gf:33, ga:63 },
                { name:'Lorient',      pts:22, mp:34, w:5, d:7, l:22, gf:31, ga:70 },
                { name:'Clermont',     pts:18, mp:34, w:3, d:9, l:22, gf:26, ga:65 },
            ],
        };
        const rows = data[leagueId] || data[39];
        const table = rows.map((r, i) => ({
            rank: i + 1,
            team: {
                id: i + 1,
                name: r.name,
                logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=1a472a&color=40e0d0&bold=true&size=64`,
            },
            points: r.pts,
            goalsDiff: r.gf - r.ga,
            all: {
                played: r.mp,
                win:    r.w,
                draw:   r.d,
                lose:   r.l,
                goals: { for: r.gf, against: r.ga },
            },
        }));
        return { response: [{ standings: [{ table }] }] };
    }

    _mockScorers(leagueId) {
        const data = {
            39: [
                { name:'Erling Haaland',     team:'Man City', goals:27, assists:5  },
                { name:'Cole Palmer',         team:'Chelsea',  goals:22, assists:11 },
                { name:'Alexander Isak',      team:'Newcastle',goals:21, assists:3  },
                { name:'Ollie Watkins',       team:'Aston Villa',goals:19, assists:13 },
                { name:'Mohammed Salah',      team:'Liverpool', goals:18, assists:9  },
                { name:'Dominic Solanke',     team:'Bournemouth',goals:19,assists:4  },
                { name:'Jarrod Bowen',        team:'West Ham', goals:17, assists:8  },
                { name:'Antoine Semenyo',     team:'Bournemouth',goals:15,assists:3 },
                { name:'Bryan Mbeumo',        team:'Brentford',goals:13, assists:6  },
                { name:'Callum Wilson',       team:'Newcastle',goals:11, assists:2  },
            ],
            140: [
                { name:'Jude Bellingham',  team:'Real Madrid',  goals:19, assists:11 },
                { name:'Robert Lewandowski',team:'Barcelona',    goals:19, assists:9  },
                { name:'Antoine Griezmann',team:'Atletico',      goals:16, assists:9  },
                { name:'Artem Dovbyk',     team:'Girona',        goals:24, assists:4  },
                { name:'Vinicius Jr.',     team:'Real Madrid',   goals:15, assists:9  },
                { name:'Alexander Sørloth',team:'Villarreal',    goals:23, assists:3  },
                { name:'Lamine Yamal',     team:'Barcelona',     goals:7,  assists:10 },
                { name:'Mikel Oyarzabal',  team:'Real Sociedad', goals:9,  assists:7  },
                { name:'Iago Aspas',       team:'Celta Vigo',    goals:15, assists:8  },
                { name:'Youssef En-Nesyri',team:'Sevilla',       goals:14, assists:2  },
            ],
            135: [
                { name:'Lautaro Martínez', team:'Inter',      goals:24, assists:4 },
                { name:'Romelu Lukaku',    team:'Roma',        goals:13, assists:4 },
                { name:'Dusan Vlahovic',   team:'Juventus',    goals:16, assists:3 },
                { name:'Olivier Giroud',   team:'AC Milan',    goals:14, assists:4 },
                { name:'Marcus Thuram',    team:'Inter',       goals:13, assists:7 },
                { name:'Khvicha Kvaratskhelia', team:'Napoli', goals:11, assists:9 },
                { name:'Ademola Lookman',  team:'Atalanta',    goals:13, assists:7 },
                { name:'Paulo Dybala',     team:'Roma',        goals:12, assists:6 },
                { name:'Victor Osimhen',   team:'Napoli',      goals:15, assists:2 },
                { name:'Ciro Immobile',    team:'Lazio',       goals:12, assists:3 },
            ],
            78: [
                { name:'Harry Kane',          team:'Bayern Munich',    goals:36, assists:8  },
                { name:'Florian Wirtz',        team:'Bayer Leverkusen', goals:18, assists:20 },
                { name:'Granit Xhaka',         team:'Bayer Leverkusen', goals:12, assists:10 },
                { name:'Victor Boniface',      team:'Bayer Leverkusen', goals:14, assists:8  },
                { name:'Serge Gnabry',         team:'Bayern Munich',    goals:14, assists:7  },
                { name:'Leroy Sané',           team:'Bayern Munich',    goals:13, assists:9  },
                { name:'Niclas Füllkrug',      team:'Dortmund',         goals:16, assists:4  },
                { name:'Patrik Schick',        team:'Bayer Leverkusen', goals:12, assists:4  },
                { name:'Ermedin Demirović',    team:'Stuttgart',        goals:14, assists:4  },
                { name:'Deniz Undav',          team:'Stuttgart',        goals:18, assists:7  },
            ],
            61: [
                { name:'Kylian Mbappé',   team:'Paris SG',   goals:27, assists:7  },
                { name:'Bradley Barcola', team:'Paris SG',   goals:16, assists:12 },
                { name:'Ousmane Dembélé', team:'Paris SG',   goals:12, assists:10 },
                { name:'Folarin Balogun', team:'Monaco',     goals:14, assists:4  },
                { name:'Martin Satriano', team:'Brest',      goals:12, assists:4  },
                { name:'Jonathan David',  team:'Lille',      goals:19, assists:4  },
                { name:'Wissam Ben Yedder',team:'Monaco',    goals:14, assists:7  },
                { name:'Lois Openda',     team:'Lens',       goals:19, assists:3  },
                { name:'Randal Kolo Muani',team:'Paris SG',  goals:12, assists:8  },
                { name:'Evann Guessand',  team:'Nice',       goals:12, assists:4  },
            ],
        };
        const players = (data[leagueId] || data[39]).map((p, i) => ({
            player: { id: i + 1, name: p.name, photo: null, nationality: '' },
            statistics: [{
                team: {
                    id: i + 1, name: p.team,
                    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.team)}&background=1a472a&color=40e0d0&bold=true&size=64`,
                },
                goals: { total: p.goals, assists: p.assists },
            }],
        }));
        return { response: players };
    }

    _mockFixtures() {
        const fixtures = [
            { home: 'Arsenal',           hScore: 2, away: 'Chelsea',       aScore: 1, league: 'Premier League', lid: 39,  status: 'FT',   venue: 'Emirates Stadium' },
            { home: 'Manchester City',   hScore: 3, away: 'Liverpool',     aScore: 1, league: 'Premier League', lid: 39,  status: 'FT',   venue: 'Etihad Stadium' },
            { home: 'Real Madrid',       hScore: 2, away: 'Barcelona',     aScore: 2, league: 'La Liga',        lid: 140, status: 'FT',   venue: 'Santiago Bernabéu' },
            { home: 'Inter Milan',       hScore: 1, away: 'Juventus',      aScore: 0, league: 'Serie A',        lid: 135, status: 'FT',   venue: 'San Siro' },
            { home: 'Bayern Munich',     hScore: 4, away: 'Dortmund',      aScore: 0, league: 'Bundesliga',     lid: 78,  status: 'FT',   venue: 'Allianz Arena' },
            { home: 'Paris SG',          hScore: 3, away: 'Marseille',     aScore: 0, league: 'Ligue 1',        lid: 61,  status: 'FT',   venue: 'Parc des Princes' },
            { home: 'Tottenham',         hScore: null, away: 'Man Utd',    aScore: null, league: 'Premier League', lid: 39, status: 'NS', venue: 'Tottenham Hotspur Stadium' },
            { home: 'Atletico Madrid',   hScore: null, away: 'Girona',     aScore: null, league: 'La Liga',     lid: 140, status: 'NS',   venue: 'Wanda Metropolitano' },
        ];
        return {
            response: fixtures.map((f, i) => ({
                fixture: { id: 9000 + i, date: new Date().toISOString(), status: { short: f.status, long: f.status === 'FT' ? 'Match Finished' : 'Not Started', elapsed: null }, venue: { name: f.venue } },
                league:  { id: f.lid, name: f.league, logo: null },
                teams: {
                    home: { id: 1000 + i, name: f.home, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(f.home)}&background=1a472a&color=40e0d0&bold=true&size=64`, winner: f.hScore > f.aScore },
                    away: { id: 2000 + i, name: f.away, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(f.away)}&background=3d195b&color=ffffff&bold=true&size=64`, winner: f.aScore > f.hScore },
                },
                goals: { home: f.hScore, away: f.aScore },
            })),
        };
    }

    async testAPI() {
        try {
            const res = await this.getLeagueStandings(39);
            return res?.response?.length
                ? { success: true, message: 'TheSportsDB connected ✓' }
                : { success: false, message: 'No data', mock: true };
        } catch {
            return { success: false, mock: true };
        }
    }
}

const footballDataService = new FootballDataService();
export default footballDataService;