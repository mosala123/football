/**
 * LeaguePage.jsx
 * ──────────────
 * ONE shared component for all 5 leagues
 * ALL DATA IS DYNAMIC - Current Season Only
 * Enhanced UI for Top Scorers and Recent Matches
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    FaTrophy, FaChartLine, FaFire, FaCalendarAlt,
    FaSearch, FaFutbol, FaStar, FaArrowRight,
    FaInfoCircle, FaShieldAlt, FaClock, FaMapMarkerAlt,
    FaCheckCircle, FaQuestionCircle, FaFootballBall,
    FaRegFutbol, FaRegClock, FaRegCalendarAlt
} from 'react-icons/fa';
import footballDataService from '../services/footballDataService';
import './MatchTable.css';

/* ─────────────────────────────────────────
   TeamBadge — logo with reliable fallback
───────────────────────────────────────── */
export const TeamBadge = ({ logo, name = 'T', color = '1a472a', size = 28 }) => {
    const [err, setErr] = useState(false);
    const hex = color.replace('#', '');
    const fb = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${hex}&color=ffffff&bold=true&size=${size * 2}`;
    
    return (
        <img
            src={err ? fb : (logo || fb)}
            alt={name}
            width={size}
            height={size}
            style={{ 
                objectFit: 'contain', 
                borderRadius: '50%', 
                flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.1)'
            }}
            onError={() => setErr(true)}
            loading="lazy"
        />
    );
};

/* ─────────────────────────────────────────
   Zone classification per league
───────────────────────────────────────── */
const zoneClass = (rank, total, leagueId) => {
    if (leagueId === 78) { // Bundesliga
        if (rank <= 4) return 'champions-league';
        if (rank === 5) return 'europa-league';
        if (rank === 6) return 'conference-league';
        if (rank === total - 1) return 'relegation-playoff';
        if (rank >= total) return 'relegation';
        return '';
    }
    if (leagueId === 61) { // Ligue 1
        if (rank <= 2) return 'champions-league';
        if (rank === 3) return 'champions-league-qualifier';
        if (rank <= 5) return 'europa-league';
        if (rank > total - 3) return 'relegation';
        return '';
    }
    // PL / La Liga / Serie A
    if (rank <= 4) return 'champions-league';
    if (rank === 5) return 'europa-league';
    if (rank === 6) return 'conference-league';
    if (rank > total - 3) return 'relegation';
    return '';
};

/* ─────────────────────────────────────────
   MatchCard Component - Enhanced for Recent Matches
───────────────────────────────────────── */
const MatchCard = ({ match, color, gradient }) => {
    const [errH, setErrH] = useState(false);
    const [errA, setErrA] = useState(false);

    const isAPI = !!match.fixture;
    const homeTeam = isAPI ? match.teams?.home : match.homeTeam;
    const awayTeam = isAPI ? match.teams?.away : match.awayTeam;
    const homeGoals = isAPI ? match.goals?.home : match.homeScore;
    const awayGoals = isAPI ? match.goals?.away : match.awayScore;
    const statusShort = isAPI ? match.fixture?.status?.short : match.status;
    const matchDate = isAPI ? new Date(match.fixture.date) : new Date(match.date);
    const matchId = isAPI ? match.fixture.id : match.id;
    const venue = isAPI ? match.fixture.venue?.name : null;
    const leagueName = isAPI ? match.league?.name : match.competition;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(statusShort);
    const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);

    const fb = (name) =>
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'T')}&background=1a472a&color=fff&bold=true&size=80`;

    const getStatusDisplay = () => {
        if (isLive) {
            return {
                text: 'LIVE',
                className: 'status-live',
                icon: <span className="live-dot" />
            };
        }
        if (isFinished) {
            return {
                text: 'FT',
                className: 'status-finished',
                icon: '✅'
            };
        }
        return {
            text: 'UPCOMING',
            className: 'status-upcoming',
            icon: '⏳'
        };
    };

    const status = getStatusDisplay();

    return (
        <Link to={`/match/${matchId}`} className="match-card-link">
            <div className={`match-card ${isLive ? 'match-card-live' : ''}`}>
                {/* League Badge */}
                {leagueName && (
                    <div className="match-league-badge">
                        <FaTrophy className="me-1" /> {leagueName}
                    </div>
                )}
                
                {/* Teams and Score */}
                <div className="match-content">
                    {/* Home Team */}
                    <div className="match-team-container home">
                        <img
                            src={errH ? fb(homeTeam?.name) : (homeTeam?.logo || fb(homeTeam?.name))}
                            alt={homeTeam?.name}
                            className="match-team-logo"
                            onError={() => setErrH(true)}
                            loading="lazy"
                        />
                        <span className="match-team-name">{homeTeam?.name}</span>
                        {isFinished && (
                            <span className={`match-team-score ${homeGoals > awayGoals ? 'winner' : ''}`}>
                                {homeGoals}
                            </span>
                        )}
                    </div>

                    {/* Match Info */}
                    <div className="match-info-center">
                        {isFinished ? (
                            <div className="match-score-display">
                                <span className="score-number" style={{ color }}>{homeGoals}</span>
                                <span className="score-separator">-</span>
                                <span className="score-number" style={{ color }}>{awayGoals}</span>
                            </div>
                        ) : (
                            <div className="match-time-display">
                                {isLive ? (
                                    <>
                                        <span className="live-badge">
                                            <span className="live-dot" /> LIVE
                                            {match.fixture?.status?.elapsed && ` ${match.fixture.status.elapsed}'`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <FaRegClock className="me-1" />
                                        {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Date */}
                        <div className="match-date-small">
                            <FaRegCalendarAlt className="me-1" />
                            {matchDate.toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short',
                                year: 'numeric'
                            })}
                        </div>
                        
                        {/* Venue */}
                        {venue && (
                            <div className="match-venue-small">
                                <FaMapMarkerAlt className="me-1" /> {venue}
                            </div>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="match-team-container away">
                        {isFinished && (
                            <span className={`match-team-score ${awayGoals > homeGoals ? 'winner' : ''}`}>
                                {awayGoals}
                            </span>
                        )}
                        <span className="match-team-name">{awayTeam?.name}</span>
                        <img
                            src={errA ? fb(awayTeam?.name) : (awayTeam?.logo || fb(awayTeam?.name))}
                            alt={awayTeam?.name}
                            className="match-team-logo"
                            onError={() => setErrA(true)}
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`match-status-badge ${status.className}`}>
                    {status.icon} {status.text}
                </div>
            </div>
        </Link>
    );
};

/* ─────────────────────────────────────────
   TopScorerCard Component - Enhanced for Top Scorers
───────────────────────────────────────── */
const TopScorerCard = ({ scorer, index, color, gradient }) => {
    const goals = scorer.statistics?.[0]?.goals?.total || 0;
    const assists = scorer.statistics?.[0]?.goals?.assists || 0;
    const team = scorer.statistics?.[0]?.team;
    const games = scorer.statistics?.[0]?.games?.appearences || 0;
    const goalsPerGame = games > 0 ? (goals / games).toFixed(2) : '0.00';
    const penalties = scorer.statistics?.[0]?.goals?.penalty || 0;
    
    const getMedal = () => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    const medal = getMedal();

    return (
        <div className="top-scorer-card">
            {/* Rank with Medal */}
            <div className="top-scorer-rank">
                {medal ? (
                    <span className="top-scorer-medal">{medal}</span>
                ) : (
                    <span className="top-scorer-number">{index + 1}</span>
                )}
            </div>

            {/* Player Avatar */}
            <div className="top-scorer-avatar">
                {scorer.player?.photo ? (
                    <img 
                        src={scorer.player.photo} 
                        alt={scorer.player.name}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    className="top-scorer-initials"
                    style={{ 
                        background: gradient,
                        display: scorer.player?.photo ? 'none' : 'flex' 
                    }}
                >
                    {scorer.player?.name?.charAt(0) || '?'}
                </div>
            </div>

            {/* Player Info */}
            <div className="top-scorer-info">
                <h4 className="top-scorer-name">{scorer.player?.name}</h4>
                <div className="top-scorer-team">
                    {team?.logo && (
                        <img 
                            src={team.logo} 
                            alt={team.name}
                            className="top-scorer-team-logo"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <span className="top-scorer-team-name">{team?.name}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="top-scorer-stats-grid">
                <div className="top-scorer-stat">
                    <span className="stat-value" style={{ color }}>{goals}</span>
                    <span className="stat-label">Goals</span>
                    {penalties > 0 && (
                        <span className="stat-penalty">({penalties} PK)</span>
                    )}
                </div>
                
                <div className="top-scorer-stat">
                    <span className="stat-value">{assists}</span>
                    <span className="stat-label">Assists</span>
                </div>
                
                <div className="top-scorer-stat">
                    <span className="stat-value">{games}</span>
                    <span className="stat-label">Games</span>
                </div>
                
                <div className="top-scorer-stat">
                    <span className="stat-value">{goalsPerGame}</span>
                    <span className="stat-label">G/Game</span>
                </div>
            </div>

            {/* Performance Bar */}
            <div className="top-scorer-performance">
                <div 
                    className="performance-bar"
                    style={{ 
                        width: `${Math.min(100, (goals / 40) * 100)}%`,
                        background: gradient 
                    }}
                />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   LeaguePage — main export
═══════════════════════════════════════════ */
const LeaguePage = ({ config }) => {
    const {
        leagueId,
        name,
        flag,
        color,
        gradient,
        season = '2024/25',
        subtitle = '',
    } = config;

    const [standings, setStandings] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [recentMatches, setRecentMatches] = useState([]);
    const [nextMatches, setNextMatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('standings');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [scorerSort, setScorerSort] = useState('goals'); // goals, assists, games

    /* ── Get current season ── */
    const getCurrentSeason = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        
        if (month >= 8) {
            return `${year}/${year + 1}`;
        } else {
            return `${year - 1}/${year}`;
        }
    };

    const currentSeason = getCurrentSeason();

    /* ── Fetch all data ── */
    useEffect(() => {
        let alive = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch standings
                const standingsRes = await footballDataService.getLeagueStandings(leagueId);
                
                // Fetch top scorers
                const scorersRes = await footballDataService.getTopScorers(leagueId);
                
                // Fetch recent matches (last 10 matches)
                const matchesRes = await footballDataService.getRecentMatches?.(leagueId, 10) || 
                                   await footballDataService.getTodayFixtures(leagueId);
                
                if (!alive) return;

                // Set standings
                if (standingsRes?.response?.[0]?.standings?.[0]?.table) {
                    setStandings(standingsRes.response[0].standings[0].table);
                }

                // Set top scorers
                if (scorersRes?.response?.length) {
                    setTopScorers(scorersRes.response);
                }

                // Set recent matches
                if (matchesRes?.response?.length) {
                    // Sort by date (most recent first)
                    const sorted = matchesRes.response.sort((a, b) => 
                        new Date(b.fixture.date) - new Date(a.fixture.date)
                    );
                    setRecentMatches(sorted.slice(0, 10));
                }

                setLastUpdated(new Date());

            } catch (err) {
                console.error('Error fetching data:', err);
                
                // Generate mock data for demo
                const mockStandings = generateMockStandings(leagueId);
                const mockScorers = generateMockScorers(leagueId);
                const mockMatches = generateMockMatches(leagueId);
                
                setStandings(mockStandings);
                setTopScorers(mockScorers);
                setRecentMatches(mockMatches);
                
                if (alive) setError('Using demo data - API unavailable');
            } finally {
                if (alive) setLoading(false);
            }
        };
        
        load();
        
        // Refresh every 5 minutes
        const interval = setInterval(load, 300000);
        return () => { 
            alive = false;
            clearInterval(interval);
        };
    }, [leagueId]);

    // Mock data generators for demo
    const generateMockStandings = (leagueId) => {
        const teams = {
            39: ['Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa', 'Tottenham', 'Manchester United', 'Chelsea', 'Newcastle', 'West Ham', 'Brighton'],
            140: ['Real Madrid', 'Barcelona', 'Girona', 'Atletico Madrid', 'Athletic Club', 'Real Sociedad', 'Betis', 'Valencia', 'Villarreal', 'Osasuna'],
            135: ['Inter', 'Milan', 'Juventus', 'Bologna', 'Roma', 'Atalanta', 'Napoli', 'Lazio', 'Fiorentina', 'Torino'],
            78: ['Bayer Leverkusen', 'Bayern Munich', 'Stuttgart', 'RB Leipzig', 'Dortmund', 'Eintracht Frankfurt', 'Freiburg', 'Hoffenheim', 'Heidenheim', 'Wolfsburg'],
            61: ['PSG', 'Monaco', 'Brest', 'Lille', 'Nice', 'Lens', 'Marseille', 'Rennes', 'Lyon', 'Toulouse']
        }[leagueId] || ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7', 'Team 8', 'Team 9', 'Team 10'];

        return teams.map((name, index) => ({
            rank: index + 1,
            team: { 
                id: index + 1, 
                name, 
                logo: `https://via.placeholder.com/30?text=${name.charAt(0)}` 
            },
            points: 50 - index * 3,
            all: {
                played: 20 - index,
                win: 10 - index,
                draw: 5,
                lose: 5 + index,
                goals: { for: 30 - index * 2, against: 20 + index }
            },
            goalsDiff: 10 - index * 2
        }));
    };

    const generateMockScorers = (leagueId) => {
        const players = [
            { name: 'Erling Haaland', team: 'Manchester City', goals: 27, assists: 5, games: 28 },
            { name: 'Harry Kane', team: 'Bayern Munich', goals: 24, assists: 8, games: 26 },
            { name: 'Kylian Mbappé', team: 'PSG', goals: 22, assists: 7, games: 25 },
            { name: 'Lautaro Martínez', team: 'Inter Milan', goals: 20, assists: 4, games: 27 },
            { name: 'Jude Bellingham', team: 'Real Madrid', goals: 18, assists: 10, games: 24 },
            { name: 'Mohamed Salah', team: 'Liverpool', goals: 17, assists: 9, games: 26 },
            { name: 'Vinicius Jr', team: 'Real Madrid', goals: 15, assists: 8, games: 23 },
            { name: 'Robert Lewandowski', team: 'Barcelona', goals: 14, assists: 5, games: 25 },
            { name: 'Son Heung-min', team: 'Tottenham', goals: 13, assists: 7, games: 26 },
            { name: 'Victor Osimhen', team: 'Napoli', goals: 12, assists: 3, games: 22 }
        ];

        return players.map((p, i) => ({
            player: { 
                id: i + 1, 
                name: p.name,
                photo: null
            },
            statistics: [{
                team: { name: p.team, logo: null },
                goals: { total: p.goals, assists: p.assists, penalty: Math.floor(p.goals / 5) },
                games: { appearences: p.games }
            }]
        }));
    };

    const generateMockMatches = (leagueId) => {
        const matches = [];
        const today = new Date();
        
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            matches.push({
                fixture: {
                    id: i + 1,
                    date: date.toISOString(),
                    status: { short: 'FT', long: 'Finished' },
                    venue: { name: 'Stadium' }
                },
                league: { name: name },
                teams: {
                    home: { 
                        id: i * 2 + 1, 
                        name: `Team ${String.fromCharCode(65 + i)}`, 
                        logo: null,
                        winner: i % 2 === 0
                    },
                    away: { 
                        id: i * 2 + 2, 
                        name: `Team ${String.fromCharCode(75 + i)}`, 
                        logo: null,
                        winner: i % 2 !== 0
                    }
                },
                goals: { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 3) }
            });
        }
        
        return matches;
    };

    /* ── Sort top scorers ── */
    const sortedTopScorers = useMemo(() => {
        if (!topScorers.length) return [];
        
        return [...topScorers].sort((a, b) => {
            if (scorerSort === 'goals') {
                return (b.statistics?.[0]?.goals?.total || 0) - (a.statistics?.[0]?.goals?.total || 0);
            } else if (scorerSort === 'assists') {
                return (b.statistics?.[0]?.goals?.assists || 0) - (a.statistics?.[0]?.goals?.assists || 0);
            } else if (scorerSort === 'games') {
                return (b.statistics?.[0]?.games?.appearences || 0) - (a.statistics?.[0]?.games?.appearences || 0);
            }
            return 0;
        });
    }, [topScorers, scorerSort]);

    /* ── Filtered standings ── */
    const filteredStandings = useMemo(() =>
        standings.filter(t =>
            t.team?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [standings, searchTerm]
    );

    /* ── Quick stats ── */
    const quickStats = useMemo(() => {
        if (!standings.length) return null;
        
        const totalGoals = standings.reduce((s, t) => s + (t.all?.goals?.for || 0), 0);
        const totalMatches = standings.reduce((s, t) => s + (t.all?.played || 0), 0) / 2;
        const avgPerGame = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0.00';
        
        return {
            leader: standings[0]?.team?.name || 'N/A',
            leaderPts: standings[0]?.points || 0,
            topScorer: sortedTopScorers[0]?.player?.name || 'N/A',
            topScorerGoals: sortedTopScorers[0]?.statistics?.[0]?.goals?.total || 0,
            totalGoals,
            avgPerGame,
            teamsCount: standings.length
        };
    }, [standings, sortedTopScorers]);

    const TABS = [
        { key: 'standings', label: '📊 Standings', icon: <FaChartLine /> },
        { key: 'scorers', label: '⚽ Top Scorers', icon: <FaFutbol /> },
        { key: 'matches', label: '⚡ Recent Matches', icon: <FaClock /> },
    ];

    /* ── Loading state ── */
    if (loading) return (
        <div className="match-container loading-container">
            <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color }} />
            <h5 style={{ color }}>Loading {name} {currentSeason}…</h5>
            <p className="text-muted">Fetching latest data from API</p>
        </div>
    );

    return (
        <div className="match-container">
            {/* Hero Section */}
            <div className="league-hero" style={{ background: gradient }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-flag">{flag}</span>
                    <div className="hero-text">
                        <h1>{name}</h1>
                        <p className="hero-subtitle">
                            Season {currentSeason} · {standings.length} Teams
                            {subtitle && ` · ${subtitle}`}
                        </p>
                        {lastUpdated && (
                            <div className="last-updated">
                                <FaClock className="me-1" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            {quickStats && (
                <div className="quick-stats-grid">
                    <div className="stat-card">
                        <FaTrophy className="stat-icon" style={{ color }} />
                        <div className="stat-info">
                            <span className="stat-label">League Leader</span>
                            <span className="stat-value">{quickStats.leader}</span>
                            <span className="stat-detail">{quickStats.leaderPts} points</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <FaFire className="stat-icon" style={{ color }} />
                        <div className="stat-info">
                            <span className="stat-label">Top Scorer</span>
                            <span className="stat-value">{quickStats.topScorer}</span>
                            <span className="stat-detail">{quickStats.topScorerGoals} goals</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <FaChartLine className="stat-icon" style={{ color }} />
                        <div className="stat-info">
                            <span className="stat-label">Total Goals</span>
                            <span className="stat-value">{quickStats.totalGoals}</span>
                            <span className="stat-detail">{quickStats.avgPerGame} per game</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="league-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                        style={activeTab === tab.key ? { backgroundColor: color, borderColor: color } : {}}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Standings Tab */}
            {activeTab === 'standings' && (
                <div className="tab-panel">
                    {/* Search */}
                    <div className="search-section">
                        <div className="search-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                className="form-control"
                                placeholder={`Search ${name} teams...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ borderColor: color }}
                            />
                            {searchTerm && (
                                <button 
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Standings Table */}
                    <div className="table-wrapper">
                        <h2 className="section-title" style={{ color }}>
                            <FaChartLine /> {name} Standings {currentSeason}
                        </h2>
                        
                        <div className="table-responsive">
                            <table className="standings-table">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th style={{ textAlign: 'left' }}>Team</th>
                                        <th>MP</th>
                                        <th>W</th>
                                        <th>D</th>
                                        <th>L</th>
                                        <th>GF</th>
                                        <th>GA</th>
                                        <th>GD</th>
                                        <th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStandings.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="no-results">
                                                No teams found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStandings.map((team, index) => {
                                            const rank = team.rank || index + 1;
                                            return (
                                                <tr
                                                    key={team.team?.id || index}
                                                    className={zoneClass(rank, standings.length, leagueId)}
                                                >
                                                    <td className="position-cell">
                                                        <span className={`position-badge position-${rank}`}>
                                                            {rank}
                                                        </span>
                                                    </td>
                                                    <td className="team-cell">
                                                        <Link to={`/club/${team.team?.id}`} className="team-link">
                                                            <TeamBadge
                                                                logo={team.team?.logo}
                                                                name={team.team?.name || ''}
                                                                color={color}
                                                                size={26}
                                                            />
                                                            <span className="team-name">{team.team?.name}</span>
                                                        </Link>
                                                    </td>
                                                    <td>{team.all?.played ?? 0}</td>
                                                    <td className="win-stat">{team.all?.win ?? 0}</td>
                                                    <td className="draw-stat">{team.all?.draw ?? 0}</td>
                                                    <td className="loss-stat">{team.all?.lose ?? 0}</td>
                                                    <td>{team.all?.goals?.for ?? 0}</td>
                                                    <td>{team.all?.goals?.against ?? 0}</td>
                                                    <td className={team.goalsDiff > 0 ? 'positive' : team.goalsDiff < 0 ? 'negative' : ''}>
                                                        {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff ?? 0}
                                                    </td>
                                                    <td className="points-cell">
                                                        <span className="points-badge" style={{ background: gradient }}>
                                                            {team.points ?? 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Scorers Tab - Enhanced */}
            {activeTab === 'scorers' && (
                <div className="tab-panel">
                    <div className="scorers-header">
                        <h2 className="section-title" style={{ color }}>
                            <FaFutbol /> {name} Top Scorers {currentSeason}
                        </h2>
                        
                        {/* Sort Controls */}
                        <div className="scorer-sort-controls">
                            <button 
                                className={`sort-btn ${scorerSort === 'goals' ? 'active' : ''}`}
                                onClick={() => setScorerSort('goals')}
                                style={scorerSort === 'goals' ? { backgroundColor: color, borderColor: color } : {}}
                            >
                                <FaFire /> Goals
                            </button>
                            <button 
                                className={`sort-btn ${scorerSort === 'assists' ? 'active' : ''}`}
                                onClick={() => setScorerSort('assists')}
                                style={scorerSort === 'assists' ? { backgroundColor: color, borderColor: color } : {}}
                            >
                                <FaStar /> Assists
                            </button>
                            <button 
                                className={`sort-btn ${scorerSort === 'games' ? 'active' : ''}`}
                                onClick={() => setScorerSort('games')}
                                style={scorerSort === 'games' ? { backgroundColor: color, borderColor: color } : {}}
                            >
                                <FaClock /> Games
                            </button>
                        </div>
                    </div>

                    {sortedTopScorers.length === 0 ? (
                        <div className="empty-state">
                            <FaFutbol className="empty-icon" />
                            <p>No scorer data available for {currentSeason} yet.</p>
                        </div>
                    ) : (
                        <div className="top-scorers-grid">
                            {sortedTopScorers.map((scorer, index) => (
                                <TopScorerCard 
                                    key={scorer.player?.id || index}
                                    scorer={scorer}
                                    index={index}
                                    color={color}
                                    gradient={gradient}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Recent Matches Tab - Enhanced */}
            {activeTab === 'matches' && (
                <div className="tab-panel">
                    <h2 className="section-title" style={{ color }}>
                        <FaClock /> Recent {name} Matches
                    </h2>

                    {recentMatches.length === 0 ? (
                        <div className="empty-state">
                            <FaCalendarAlt className="empty-icon" />
                            <p>No recent matches found for {currentSeason}.</p>
                        </div>
                    ) : (
                        <div className="recent-matches-grid">
                            {recentMatches.map((match, index) => (
                                <MatchCard 
                                    key={index} 
                                    match={match} 
                                    color={color} 
                                    gradient={gradient} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaguePage;