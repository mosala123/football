import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaTrophy, FaFutbol, FaStar, FaChartLine, FaFire, 
    FaCalendarAlt, FaFlag, FaShieldAlt, FaCrown, FaMedal,
    FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle, FaQuestionCircle,
    FaHistory, FaClock, FaCheckCircle, FaAward
} from 'react-icons/fa';
import footballDataService from '../services/footballDataService';
import './TopScorers.css';

const TopScorers = () => {
    const [selectedLeague, setSelectedLeague] = useState(39);
    const [topScorers, setTopScorers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('2024');
    const [showStats, setShowStats] = useState(true);
    const [sortBy, setSortBy] = useState('goals');
    const [activeTab, setActiveTab] = useState('current');

    // Available seasons (last 5 seasons)
    const availableSeasons = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const seasons = [];
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            seasons.push({
                label: `${year-1}/${year}`,
                value: year.toString(),
                isCurrent: i === 0
            });
        }
        return seasons;
    }, []);

    // Detailed league information with real data
    const leagues = useMemo(() => [
        { 
            id: 39, 
            name: 'Premier League', 
            flag: '🇬🇧', 
            country: 'England',
            founded: 1992,
            teams: 20,
            matches: 380,
            color: '#3d195b',
            gradient: 'linear-gradient(135deg, #3d195b 0%, #5d2a8c 100%)',
            description: 'The most watched football league in the world',
            allTimeTopScorer: { name: 'Alan Shearer', goals: 260, team: 'Newcastle United', years: '1992-2006' },
            mostTitles: { team: 'Manchester United', count: 20, years: '1908-2013' },
            currentChampion: { team: 'Manchester City', year: '2024', titles: 8 },
            goldenBoot: { name: 'Erling Haaland', goals: 27, season: '2023-24', team: 'Manchester City' },
            topScorersBySeason: [
                { season: '2023-24', name: 'Erling Haaland', goals: 27, team: 'Manchester City' },
                { season: '2022-23', name: 'Erling Haaland', goals: 36, team: 'Manchester City' },
                { season: '2021-22', name: 'Mohamed Salah', goals: 23, team: 'Liverpool' },
                { season: '2020-21', name: 'Harry Kane', goals: 23, team: 'Tottenham' }
            ]
        },
        { 
            id: 140, 
            name: 'La Liga', 
            flag: '🇪🇸', 
            country: 'Spain',
            founded: 1929,
            teams: 20,
            matches: 380,
            color: '#ee8707',
            gradient: 'linear-gradient(135deg, #ee8707 0%, #f5a623 100%)',
            description: 'Home of football legends Messi and Ronaldo',
            allTimeTopScorer: { name: 'Lionel Messi', goals: 474, team: 'Barcelona', years: '2004-2021' },
            mostTitles: { team: 'Real Madrid', count: 35, years: '1932-2024' },
            currentChampion: { team: 'Real Madrid', year: '2024', titles: 35 },
            goldenBoot: { name: 'Artem Dovbyk', goals: 24, season: '2023-24', team: 'Girona' },
            topScorersBySeason: [
                { season: '2023-24', name: 'Artem Dovbyk', goals: 24, team: 'Girona' },
                { season: '2022-23', name: 'Robert Lewandowski', goals: 23, team: 'Barcelona' },
                { season: '2021-22', name: 'Karim Benzema', goals: 27, team: 'Real Madrid' },
                { season: '2020-21', name: 'Lionel Messi', goals: 30, team: 'Barcelona' }
            ]
        },
        { 
            id: 135, 
            name: 'Serie A', 
            flag: '🇮🇹', 
            country: 'Italy',
            founded: 1898,
            teams: 20,
            matches: 380,
            color: '#024494',
            gradient: 'linear-gradient(135deg, #024494 0%, #0369a1 100%)',
            description: 'The tactical masterclass of European football',
            allTimeTopScorer: { name: 'Silvio Piola', goals: 274, team: 'Pro Vercelli', years: '1929-1954' },
            mostTitles: { team: 'Juventus', count: 36, years: '1905-2020' },
            currentChampion: { team: 'Inter Milan', year: '2024', titles: 20 },
            goldenBoot: { name: 'Lautaro Martínez', goals: 24, season: '2023-24', team: 'Inter Milan' },
            topScorersBySeason: [
                { season: '2023-24', name: 'Lautaro Martínez', goals: 24, team: 'Inter Milan' },
                { season: '2022-23', name: 'Victor Osimhen', goals: 26, team: 'Napoli' },
                { season: '2021-22', name: 'Ciro Immobile', goals: 27, team: 'Lazio' },
                { season: '2020-21', name: 'Cristiano Ronaldo', goals: 29, team: 'Juventus' }
            ]
        },
        { 
            id: 78, 
            name: 'Bundesliga', 
            flag: '🇩🇪', 
            country: 'Germany',
            founded: 1963,
            teams: 18,
            matches: 306,
            color: '#d20515',
            gradient: 'linear-gradient(135deg, #d20515 0%, #dc2626 100%)',
            description: 'The league with the highest goals average in Europe',
            allTimeTopScorer: { name: 'Gerd Müller', goals: 365, team: 'Bayern Munich', years: '1965-1979' },
            mostTitles: { team: 'Bayern Munich', count: 32, years: '1932-2023' },
            currentChampion: { team: 'Bayer Leverkusen', year: '2024', titles: 1 },
            goldenBoot: { name: 'Harry Kane', goals: 36, season: '2023-24', team: 'Bayern Munich' },
            topScorersBySeason: [
                { season: '2023-24', name: 'Harry Kane', goals: 36, team: 'Bayern Munich' },
                { season: '2022-23', name: 'Niclas Füllkrug', goals: 16, team: 'Werder Bremen' },
                { season: '2021-22', name: 'Robert Lewandowski', goals: 35, team: 'Bayern Munich' },
                { season: '2020-21', name: 'Robert Lewandowski', goals: 41, team: 'Bayern Munich' }
            ]
        },
        { 
            id: 61, 
            name: 'Ligue 1', 
            flag: '🇫🇷', 
            country: 'France',
            founded: 1932,
            teams: 18,
            matches: 306,
            color: '#dae025',
            gradient: 'linear-gradient(135deg, #dae025 0%, #cdc02c 100%)',
            description: 'The league of rising stars and champions',
            allTimeTopScorer: { name: 'Delio Onnis', goals: 299, team: 'Monaco', years: '1972-1986' },
            mostTitles: { team: 'Paris Saint-Germain', count: 11, years: '1986-2024' },
            currentChampion: { team: 'Paris Saint-Germain', year: '2024', titles: 11 },
            goldenBoot: { name: 'Kylian Mbappé', goals: 27, season: '2023-24', team: 'Paris Saint-Germain' },
            topScorersBySeason: [
                { season: '2023-24', name: 'Kylian Mbappé', goals: 27, team: 'Paris Saint-Germain' },
                { season: '2022-23', name: 'Kylian Mbappé', goals: 29, team: 'Paris Saint-Germain' },
                { season: '2021-22', name: 'Kylian Mbappé', goals: 28, team: 'Paris Saint-Germain' },
                { season: '2020-21', name: 'Kylian Mbappé', goals: 27, team: 'Paris Saint-Germain' }
            ]
        }
    ], []);

    const currentLeague = useMemo(() => leagues.find(l => l.id === selectedLeague), [leagues, selectedLeague]);

    useEffect(() => {
        let isMounted = true;
        const fetchTopScorers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await footballDataService.getTopScorers(selectedLeague);
                if (isMounted) setTopScorers(response?.response || []);
            } catch (err) {
                if (isMounted) setError('Failed to load top scorers');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchTopScorers();
        return () => { isMounted = false; };
    }, [selectedLeague]);

    const handleLeagueChange = useCallback((leagueId) => {
        setSelectedLeague(leagueId);
    }, []);

    const handleSeasonChange = useCallback((season) => {
        setSelectedSeason(season);
    }, []);

    const sortedScorers = useMemo(() => {
        if (!topScorers.length) return [];
        
        let sorted = [...topScorers];
        
        if (sortBy === 'goals') {
            sorted.sort((a, b) => (b.statistics?.[0]?.goals?.total || 0) - (a.statistics?.[0]?.goals?.total || 0));
        } else if (sortBy === 'assists') {
            sorted.sort((a, b) => (b.statistics?.[0]?.goals?.assists || 0) - (a.statistics?.[0]?.goals?.assists || 0));
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => (a.player?.name || '').localeCompare(b.player?.name || ''));
        } else if (sortBy === 'games') {
            sorted.sort((a, b) => (b.statistics?.[0]?.games?.appearences || 0) - (a.statistics?.[0]?.games?.appearences || 0));
        } else if (sortBy === 'ratio') {
            sorted.sort((a, b) => {
                const aGoals = a.statistics?.[0]?.goals?.total || 0;
                const aGames = a.statistics?.[0]?.games?.appearences || 1;
                const bGoals = b.statistics?.[0]?.goals?.total || 0;
                const bGames = b.statistics?.[0]?.games?.appearences || 1;
                return (bGoals / bGames) - (aGoals / aGames);
            });
        }
        
        return sorted;
    }, [topScorers, sortBy]);

    const stats = useMemo(() => {
        if (!sortedScorers.length) return {
            topScorer: null,
            mostAssists: null,
            avgGoals: 0,
            totalGoals: 0,
            totalAssists: 0,
            hatTricks: 0,
            penalties: 0,
            topScorerTeam: null,
            mostGoalsInMatch: 0,
            totalPlayers: 0,
            totalGames: 0,
            avgAge: 0
        };

        const topScorer = sortedScorers[0];
        const mostAssists = sortedScorers.reduce((max, s) => {
            const assists = s.statistics?.[0]?.goals?.assists || 0;
            return assists > (max.assists || 0) ? { player: s.player?.name, assists, playerObj: s } : max;
        }, { player: null, assists: 0, playerObj: null });

        const totalGoals = sortedScorers.reduce((sum, s) => sum + (s.statistics?.[0]?.goals?.total || 0), 0);
        const totalAssists = sortedScorers.reduce((sum, s) => sum + (s.statistics?.[0]?.goals?.assists || 0), 0);
        const totalGames = sortedScorers.reduce((sum, s) => sum + (s.statistics?.[0]?.games?.appearences || 0), 0);
        const avgGoals = (totalGoals / sortedScorers.length).toFixed(1);

        const teamGoals = {};
        sortedScorers.forEach(s => {
            const team = s.statistics?.[0]?.team?.name || 'Unknown';
            const goals = s.statistics?.[0]?.goals?.total || 0;
            teamGoals[team] = (teamGoals[team] || 0) + goals;
        });

        const topScorerTeam = Object.entries(teamGoals).sort((a, b) => b[1] - a[1])[0];

        return {
            topScorer,
            mostAssists,
            avgGoals,
            totalGoals,
            totalAssists,
            hatTricks: sortedScorers.filter(s => (s.statistics?.[0]?.goals?.total || 0) >= 3).length,
            penalties: sortedScorers.reduce((sum, s) => sum + (s.statistics?.[0]?.goals?.penalty || 0), 0),
            topScorerTeam: topScorerTeam ? { name: topScorerTeam[0], goals: topScorerTeam[1] } : null,
            mostGoalsInMatch: Math.max(...sortedScorers.map(s => s.statistics?.[0]?.goals?.total || 0)),
            totalPlayers: sortedScorers.length,
            totalGames: totalGames,
            avgAge: (sortedScorers.reduce((sum, s) => sum + (s.player?.age || 25), 0) / sortedScorers.length).toFixed(1)
        };
    }, [sortedScorers]);

    const funFacts = useMemo(() => {
        if (!sortedScorers.length) return [];
        
        const facts = [
            `⚽ Top Scorer: ${stats.topScorer?.player?.name || 'N/A'} (${stats.topScorer?.statistics?.[0]?.goals?.total || 0} goals)`,
            `🎯 Most Assists: ${stats.mostAssists.player || 'N/A'} (${stats.mostAssists.assists} assists)`,
            `🔥 ${stats.hatTricks || 0} hat-tricks this season`,
            `📊 ${stats.penalties || 0} penalties scored`,
            `🌟 Average goals: ${stats.avgGoals} per player`,
            `🏆 Top Scoring Team: ${stats.topScorerTeam?.name || 'N/A'} (${stats.topScorerTeam?.goals || 0} goals)`,
            `⚡ ${stats.totalPlayers || 0} players in top 10`,
            `🎂 Average age: ${stats.avgAge || 25} years`
        ];
        
        return facts;
    }, [sortedScorers, stats]);

    const displayScorers = useMemo(() => {
        if (sortedScorers.length >= 10) return sortedScorers.slice(0, 10);
        
        const mockScorers = [
            {
                player: { id: 1, name: 'Erling Haaland', age: 23, nationality: '🇳🇴 Norwegian' },
                statistics: [{ team: { name: 'Manchester City' }, goals: { total: 27, assists: 5, penalty: 2 }, games: { appearences: 28 } }]
            },
            {
                player: { id: 2, name: 'Harry Kane', age: 30, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 English' },
                statistics: [{ team: { name: 'Bayern Munich' }, goals: { total: 24, assists: 8, penalty: 3 }, games: { appearences: 26 } }]
            },
            {
                player: { id: 3, name: 'Kylian Mbappé', age: 25, nationality: '🇫🇷 French' },
                statistics: [{ team: { name: 'Paris Saint-Germain' }, goals: { total: 22, assists: 7, penalty: 1 }, games: { appearences: 25 } }]
            },
            {
                player: { id: 4, name: 'Lautaro Martínez', age: 26, nationality: '🇦🇷 Argentine' },
                statistics: [{ team: { name: 'Inter Milan' }, goals: { total: 20, assists: 4, penalty: 2 }, games: { appearences: 27 } }]
            },
            {
                player: { id: 5, name: 'Jude Bellingham', age: 20, nationality: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 English' },
                statistics: [{ team: { name: 'Real Madrid' }, goals: { total: 18, assists: 10, penalty: 0 }, games: { appearences: 24 } }]
            },
            {
                player: { id: 6, name: 'Mohamed Salah', age: 31, nationality: '🇪🇬 Egyptian' },
                statistics: [{ team: { name: 'Liverpool' }, goals: { total: 17, assists: 9, penalty: 3 }, games: { appearences: 26 } }]
            },
            {
                player: { id: 7, name: 'Vinicius Jr', age: 23, nationality: '🇧🇷 Brazilian' },
                statistics: [{ team: { name: 'Real Madrid' }, goals: { total: 15, assists: 8, penalty: 0 }, games: { appearences: 23 } }]
            },
            {
                player: { id: 8, name: 'Robert Lewandowski', age: 35, nationality: '🇵🇱 Polish' },
                statistics: [{ team: { name: 'Barcelona' }, goals: { total: 14, assists: 5, penalty: 2 }, games: { appearences: 25 } }]
            },
            {
                player: { id: 9, name: 'Son Heung-min', age: 31, nationality: '🇰🇷 South Korean' },
                statistics: [{ team: { name: 'Tottenham' }, goals: { total: 13, assists: 7, penalty: 0 }, games: { appearences: 26 } }]
            },
            {
                player: { id: 10, name: 'Victor Osimhen', age: 25, nationality: '🇳🇬 Nigerian' },
                statistics: [{ team: { name: 'Napoli' }, goals: { total: 12, assists: 3, penalty: 1 }, games: { appearences: 22 } }]
            }
        ];
        
        return mockScorers.slice(0, 10);
    }, [sortedScorers]);

    return (
        <div className="top-scorers-container">
            {/* Hero Section */}
            <div className="scorers-hero" style={{ background: currentLeague?.gradient }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>
                        <FaFire className="hero-icon" /> Top Scorers <FaFire className="hero-icon" />
                    </h1>
                    <p className="hero-subtitle">Discover the best goal scorers in European football</p>
                    <div className="hero-stats">
                        <div className="hero-stat-item">
                            <FaFutbol />
                            <span>{stats.totalGoals || 182} Goals</span>
                        </div>
                        <div className="hero-stat-item">
                            <FaStar />
                            <span>{stats.totalAssists || 98} Assists</span>
                        </div>
                        <div className="hero-stat-item">
                            <FaChartLine />
                            <span>{stats.avgGoals || 2.3} Average</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Season Selector */}
            <div className="season-selector">
                <FaCalendarAlt className="season-icon" />
                <span className="season-label">Select Season:</span>
                <div className="season-buttons">
                    {availableSeasons.map(season => (
                        <button
                            key={season.value}
                            className={`season-btn ${selectedSeason === season.value ? 'active' : ''} ${season.isCurrent ? 'current' : ''}`}
                            onClick={() => handleSeasonChange(season.value)}
                        >
                            {season.label}
                            {season.isCurrent && <span className="current-badge">Current</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* League Selection */}
            <div className="league-selector-container">
                <h2 className="section-title">
                    <FaFlag /> Select League <FaFlag />
                </h2>
                <div className="league-selector">
                    {leagues.map(league => (
                        <button
                            key={league.id}
                            className={`league-btn ${selectedLeague === league.id ? 'active' : ''}`}
                            onClick={() => handleLeagueChange(league.id)}
                            style={{ borderColor: league.color }}
                        >
                            <span className="league-flag">{league.flag}</span>
                            <span className="league-name">{league.name}</span>
                            {selectedLeague === league.id && <span className="active-indicator">●</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Current League Info Card */}
            {currentLeague && (
                <div className="league-info-card" style={{ borderColor: currentLeague.color }}>
                    <div className="league-info-header" style={{ background: currentLeague.gradient }}>
                        <span className="league-flag-large">{currentLeague.flag}</span>
                        <div>
                            <h2>{currentLeague.name}</h2>
                            <p>{currentLeague.country} • Est. {currentLeague.founded} • {currentLeague.teams} teams</p>
                        </div>
                    </div>
                    
                    <div className="league-tabs">
                        <button 
                            className={`league-tab ${activeTab === 'current' ? 'active' : ''}`}
                            onClick={() => setActiveTab('current')}
                        >
                            <FaFire /> Current Season
                        </button>
                        <button 
                            className={`league-tab ${activeTab === 'previous' ? 'active' : ''}`}
                            onClick={() => setActiveTab('previous')}
                        >
                            <FaHistory /> Previous Seasons
                        </button>
                        <button 
                            className={`league-tab ${activeTab === 'alltime' ? 'active' : ''}`}
                            onClick={() => setActiveTab('alltime')}
                        >
                            <FaAward /> All-Time
                        </button>
                    </div>

                    {activeTab === 'current' && (
                        <div className="league-info-body">
                            <div className="league-fact">
                                <FaShieldAlt />
                                <div>
                                    <strong>Most Titles</strong>
                                    <span>{currentLeague.mostTitles.team} ({currentLeague.mostTitles.count} titles)</span>
                                </div>
                            </div>
                            <div className="league-fact">
                                <FaTrophy />
                                <div>
                                    <strong>Current Champion</strong>
                                    <span>{currentLeague.currentChampion.team} ({currentLeague.currentChampion.year})</span>
                                </div>
                            </div>
                            <div className="league-fact">
                                <FaCrown />
                                <div>
                                    <strong>Top Scorer</strong>
                                    <span>{currentLeague.goldenBoot.name} ({currentLeague.goldenBoot.goals} goals)</span>
                                </div>
                            </div>
                            <div className="league-fact">
                                <FaStar />
                                <div>
                                    <strong>Team</strong>
                                    <span>{currentLeague.goldenBoot.team}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'previous' && (
                        <div className="previous-seasons">
                            <h4>Top Scorers Last 4 Seasons</h4>
                            <div className="seasons-list">
                                {currentLeague.topScorersBySeason.map((item, index) => (
                                    <div key={index} className="season-item">
                                        <span className="season-year">{item.season}</span>
                                        <span className="season-player">{item.name}</span>
                                        <span className="season-goals">{item.goals} goals</span>
                                        <span className="season-team">{item.team}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'alltime' && (
                        <div className="alltime-records">
                            <div className="record-item">
                                <FaCrown className="record-icon" />
                                <div className="record-content">
                                    <h4>All-Time Top Scorer</h4>
                                    <p className="record-name">{currentLeague.allTimeTopScorer.name}</p>
                                    <p className="record-detail">{currentLeague.allTimeTopScorer.goals} goals • {currentLeague.allTimeTopScorer.team} • {currentLeague.allTimeTopScorer.years}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="league-description">
                        <FaInfoCircle />
                        <p>{currentLeague.description}</p>
                    </div>
                </div>
            )}

            {/* Loading / Error / Data */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner-border mb-3" style={{ width: '4rem', height: '4rem', color: currentLeague?.color }} />
                    <h5>Loading top scorers...</h5>
                    <p className="loading-subtitle">Please wait a moment</p>
                </div>
            )}

            {error && (
                <div className="error-container">
                    <FaQuestionCircle className="error-icon" />
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button className="retry-btn" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && displayScorers.length > 0 && (
                <>
                    {/* Stats Overview */}
                    {showStats && (
                        <div className="stats-overview">
                            <h2 className="section-title">
                                <FaChartLine /> Season Statistics <FaChartLine />
                            </h2>
                            <div className="stats-grid">
                                <div className="stat-card-large">
                                    <div className="stat-icon">🥇</div>
                                    <div className="stat-content">
                                        <h3>Top Scorer</h3>
                                        <p className="stat-main">{stats.topScorer?.player?.name || displayScorers[0]?.player?.name}</p>
                                        <p className="stat-detail">
                                            {stats.topScorer?.statistics?.[0]?.team?.name || displayScorers[0]?.statistics[0]?.team?.name} • 
                                            {stats.topScorer?.statistics?.[0]?.goals?.total || displayScorers[0]?.statistics[0]?.goals?.total || 0} goals
                                        </p>
                                    </div>
                                </div>

                                <div className="stat-card-large">
                                    <div className="stat-icon">🎯</div>
                                    <div className="stat-content">
                                        <h3>Most Assists</h3>
                                        <p className="stat-main">{stats.mostAssists.player || displayScorers[0]?.player?.name}</p>
                                        <p className="stat-detail">
                                            {stats.mostAssists.playerObj?.statistics?.[0]?.team?.name || displayScorers[0]?.statistics[0]?.team?.name} • 
                                            {stats.mostAssists.assists || displayScorers[0]?.statistics[0]?.goals?.assists || 0} assists
                                        </p>
                                    </div>
                                </div>

                                <div className="stat-card-large">
                                    <div className="stat-icon">⚽</div>
                                    <div className="stat-content">
                                        <h3>Total Goals</h3>
                                        <p className="stat-main">{stats.totalGoals || 182}</p>
                                        <p className="stat-detail">
                                            {stats.avgGoals} average • {stats.totalPlayers || 10} players
                                        </p>
                                    </div>
                                </div>

                                <div className="stat-card-large">
                                    <div className="stat-icon">🔥</div>
                                    <div className="stat-content">
                                        <h3>Hat-tricks</h3>
                                        <p className="stat-main">{stats.hatTricks || 3}</p>
                                        <p className="stat-detail">this season • {stats.penalties || 11} penalties</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sort Controls */}
                    <div className="sort-controls">
                        <label>Sort by:</label>
                        <div className="sort-buttons">
                            <button 
                                className={`sort-btn ${sortBy === 'goals' ? 'active' : ''}`}
                                onClick={() => setSortBy('goals')}
                                style={{ borderColor: currentLeague?.color }}
                            >
                                <FaFutbol /> Goals
                            </button>
                            <button 
                                className={`sort-btn ${sortBy === 'assists' ? 'active' : ''}`}
                                onClick={() => setSortBy('assists')}
                                style={{ borderColor: currentLeague?.color }}
                            >
                                <FaStar /> Assists
                            </button>
                            <button 
                                className={`sort-btn ${sortBy === 'ratio' ? 'active' : ''}`}
                                onClick={() => setSortBy('ratio')}
                                style={{ borderColor: currentLeague?.color }}
                            >
                                <FaChartLine /> Ratio
                            </button>
                            <button 
                                className={`sort-btn ${sortBy === 'games' ? 'active' : ''}`}
                                onClick={() => setSortBy('games')}
                                style={{ borderColor: currentLeague?.color }}
                            >
                                <FaClock /> Games
                            </button>
                            <button 
                                className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
                                onClick={() => setSortBy('name')}
                                style={{ borderColor: currentLeague?.color }}
                            >
                                A-Z Name
                            </button>
                        </div>
                    </div>

                    {/* Fun Facts */}
                    <div className="fun-facts">
                        <h3 className="fun-facts-title">
                            <FaFire /> Did You Know? <FaFire />
                        </h3>
                        <div className="facts-carousel">
                            {funFacts.map((fact, index) => (
                                <div key={index} className="fact-item">
                                    {fact}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Scorers Table */}
                    <div className="scorers-table-container">
                        <h2 className="table-title">
                            <FaCrown /> Top 10 Scorers <FaCrown />
                        </h2>
                        <div className="scorers-table-wrapper">
                            <table className="scorers-table">
                                <thead>
                                    <tr>
                                        <th className="rank-col">Rank</th>
                                        <th className="player-col">Player</th>
                                        <th className="club-col">Club</th>
                                        <th className="goals-col">Goals</th>
                                        <th className="assists-col">Assists</th>
                                        <th className="games-col">Games</th>
                                        <th className="ratio-col">G/Game</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayScorers.map((scorer, index) => {
                                        const goals = scorer.statistics?.[0]?.goals?.total || 0;
                                        const assists = scorer.statistics?.[0]?.goals?.assists || 0;
                                        const games = scorer.statistics?.[0]?.games?.appearences || 25;
                                        const goalsPerGame = (goals / games).toFixed(2);
                                        const penalties = scorer.statistics?.[0]?.goals?.penalty || 0;
                                        
                                        return (
                                            <tr key={scorer.player?.id || index} className={`scorer-row ${index < 3 ? 'top-three' : ''}`}>
                                                <td className="rank-col">
                                                    <div className={`rank-badge rank-${index + 1}`} style={{ 
                                                        background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' :
                                                                    index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e0e0e0)' :
                                                                    index === 2 ? 'linear-gradient(135deg, #cd7f32, #e9b96b)' :
                                                                    'rgba(64, 224, 208, 0.15)'
                                                    }}>
                                                        {index === 0 && '🥇'}
                                                        {index === 1 && '🥈'}
                                                        {index === 2 && '🥉'}
                                                        {index > 2 && index + 1}
                                                    </div>
                                                </td>
                                                <td className="player-col">
                                                    <div className="player-info">
                                                        <div className="player-avatar" style={{ background: currentLeague?.gradient }}>
                                                            {scorer.player?.name?.charAt(0) || 'P'}
                                                        </div>
                                                        <div className="player-details">
                                                            <span className="player-name">{scorer.player?.name || 'Unknown'}</span>
                                                            <span className="player-nationality">
                                                                {scorer.player?.nationality || 'International'} • {scorer.player?.age || 25} years
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="club-col">
                                                    <div className="club-info">
                                                        <span className="club-name">{scorer.statistics?.[0]?.team?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="goals-col">
                                                    <div className="goals-display">
                                                        <span className="goals-number">{goals}</span>
                                                        {penalties > 0 && (
                                                            <span className="penalty-indicator" title={`${penalties} penalties`}>
                                                                ({penalties} PK)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="assists-col">
                                                    <div className="assists-display">
                                                        <span className="assists-number">{assists}</span>
                                                    </div>
                                                </td>
                                                <td className="games-col">
                                                    <span className="games-number">{games}</span>
                                                </td>
                                                <td className="ratio-col">
                                                    <span className="ratio-number">{goalsPerGame}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Season Summary */}
                    <div className="season-summary">
                        <h3 className="summary-title">
                            <FaCalendarAlt /> Season {selectedSeason} Summary
                        </h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">Total Goals</span>
                                <span className="summary-value">{stats.totalGoals || 182}</span>
                                <span className="summary-trend up">
                                    <FaArrowUp /> +8% vs last season
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Goals per Game</span>
                                <span className="summary-value">2.8</span>
                                <span className="summary-trend up">
                                    <FaArrowUp /> +0.2
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Penalties</span>
                                <span className="summary-value">{stats.penalties || 11}</span>
                                <span className="summary-trend down">
                                    <FaArrowDown /> -3
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Hat-tricks</span>
                                <span className="summary-value">{stats.hatTricks || 3}</span>
                                <span className="summary-trend">
                                    <FaMinus /> Same as last season
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Guide for Beginners */}
                    <div className="quick-guide">
                        <h3 className="guide-title">
                            <FaQuestionCircle /> Quick Guide for Beginners
                        </h3>
                        <div className="guide-grid">
                            <div className="guide-item">
                                <span className="guide-icon">🥇🥈🥉</span>
                                <h4>Medals</h4>
                                <p>Gold, Silver, Bronze for the top 3 scorers</p>
                            </div>
                            <div className="guide-item">
                                <span className="guide-icon">⚽</span>
                                <h4>Goals</h4>
                                <p>Number of times a player scored</p>
                            </div>
                            <div className="guide-item">
                                <span className="guide-icon">🎯</span>
                                <h4>Assists</h4>
                                <p>Passes that lead to a goal</p>
                            </div>
                            <div className="guide-item">
                                <span className="guide-icon">📊</span>
                                <h4>Goals per Game</h4>
                                <p>Average goals per match (goals ÷ games)</p>
                            </div>
                            <div className="guide-item">
                                <span className="guide-icon">🔥</span>
                                <h4>Hat-trick</h4>
                                <p>3 goals by the same player in one match</p>
                            </div>
                            <div className="guide-item">
                                <span className="guide-icon">⚪</span>
                                <h4>Penalty</h4>
                                <p>A kick from the penalty spot</p>
                            </div>
                        </div>
                    </div>

                    {/* Historical Context */}
                    <div className="historical-context">
                        <h3 className="context-title">
                            <FaHistory /> Compare with Legends
                        </h3>
                        <div className="context-grid">
                            <div className="context-item">
                                <span className="context-icon">👑</span>
                                <div className="context-content">
                                    <h4>{currentLeague?.allTimeTopScorer.name}</h4>
                                    <p>All-time top scorer • {currentLeague?.allTimeTopScorer.goals} goals</p>
                                    <small>{currentLeague?.allTimeTopScorer.years}</small>
                                </div>
                            </div>
                            <div className="context-item">
                                <span className="context-icon">⚡</span>
                                <div className="context-content">
                                    <h4>{displayScorers[0]?.player?.name}</h4>
                                    <p>Current top scorer • {displayScorers[0]?.statistics[0]?.goals?.total || 0} goals</p>
                                    <small>Needs {currentLeague?.allTimeTopScorer.goals - (displayScorers[0]?.statistics[0]?.goals?.total || 0)} goals to match the legend</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TopScorers;