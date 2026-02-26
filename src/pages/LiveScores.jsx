import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFutbol, FaFire, FaCalendarAlt, FaClock, 
    FaMapMarkerAlt, FaFilter, FaRedoAlt, FaFlag 
} from 'react-icons/fa';
import footballDataService from '../services/footballDataService';
import './LiveScores.css';

/* ===== Constants ===== */
const STATUS_MAP = {
    '1H':  { label: 'LIVE', variant: 'danger', icon: '🔴', desc: 'First Half' },
    '2H':  { label: 'LIVE', variant: 'danger', icon: '🔴', desc: 'Second Half' },
    'HT':  { label: 'HT', variant: 'warning', icon: '⏸️', desc: 'Half Time' },
    'ET':  { label: 'ET', variant: 'danger', icon: '🔴', desc: 'Extra Time' },
    'P':   { label: 'PEN', variant: 'danger', icon: '⚪', desc: 'Penalties' },
    'FT':  { label: 'FT', variant: 'success', icon: '✅', desc: 'Full Time' },
    'AET': { label: 'AET', variant: 'success', icon: '✅', desc: 'After Extra Time' },
    'PEN': { label: 'PEN', variant: 'success', icon: '✅', desc: 'After Penalties' },
    'NS':  { label: 'Upcoming', variant: 'info', icon: '⏳', desc: 'Not Started' },
    'TBD': { label: 'TBD', variant: 'secondary', icon: '❓', desc: 'To Be Decided' },
    'PST': { label: 'Postponed', variant: 'secondary', icon: '⏱️', desc: 'Postponed' },
};

const LIVE_CODES = ['1H', '2H', 'HT', 'ET', 'P'];
const FINISHED_CODES = ['FT', 'AET', 'PEN'];
const UPCOMING_CODES = ['NS', 'TBD'];

const LEAGUES = [
    { id: 39,  name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', color: '#3d195b', gradient: 'linear-gradient(135deg, #3d195b 0%, #5d2a8c 100%)' },
    { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain', color: '#ee8707', gradient: 'linear-gradient(135deg, #ee8707 0%, #f5a623 100%)' },
    { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy', color: '#024494', gradient: 'linear-gradient(135deg, #024494 0%, #0369a1 100%)' },
    { id: 78,  name: 'Bundesliga', flag: '🇩🇪', country: 'Germany', color: '#d20515', gradient: 'linear-gradient(135deg, #d20515 0%, #dc2626 100%)' },
    { id: 61,  name: 'Ligue 1', flag: '🇫🇷', country: 'France', color: '#dae025', gradient: 'linear-gradient(135deg, #dae025 0%, #cdc02c 100%)' }
];

/* ===== Team Logo Component ===== */
const TeamLogo = ({ src, name, size = 40 }) => {
    const [error, setError] = useState(false);
    
    return (
        <div className="team-logo-wrapper" style={{ width: size, height: size }}>
            {!error && src ? (
                <img 
                    src={src} 
                    alt={name}
                    className="team-logo-img"
                    onError={() => setError(true)}
                    loading="lazy"
                />
            ) : (
                <div className="team-logo-fallback" style={{ background: 'linear-gradient(135deg, #40e0d0, #2d6a4f)' }}>
                    {name?.charAt(0) || '?'}
                </div>
            )}
        </div>
    );
};

/* ===== Match Card Component ===== */
const MatchCard = ({ match }) => {
    const status = STATUS_MAP[match.fixture?.status?.short] || STATUS_MAP.NS;
    const isLive = LIVE_CODES.includes(match.fixture?.status?.short);
    const isFinished = FINISHED_CODES.includes(match.fixture?.status?.short);
    
    const league = LEAGUES.find(l => l.id === match.league?.id);
    const matchDate = new Date(match.fixture?.date);
    const matchTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const matchDay = matchDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    
    const homeScore = match.goals?.home ?? '-';
    const awayScore = match.goals?.away ?? '-';
    const homeWinner = isFinished && match.goals?.home > match.goals?.away;
    const awayWinner = isFinished && match.goals?.away > match.goals?.home;

    return (
        <div className="col-12 col-md-6 col-lg-4 mb-4">
            <Link to={`/match/${match.fixture?.id}`} className="text-decoration-none">
                <div className={`card match-card h-100 ${isLive ? 'match-card-live' : ''}`}>
                    {/* Card Header */}
                    <div className="card-header match-card-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <span className="league-flag">{league?.flag || '🏆'}</span>
                            <span className="league-name">{match.league?.name}</span>
                        </div>
                        <span className={`badge bg-${status.variant} match-status-badge ${isLive ? 'pulse-animation' : ''}`}>
                            {status.icon} {status.label}
                            {isLive && match.fixture?.status?.elapsed && ` ${match.fixture.status.elapsed}'`}
                        </span>
                    </div>

                    {/* Card Body */}
                    <div className="card-body match-card-body">
                        {/* Home Team */}
                        <div className="match-team-row">
                            <div className="match-team home-team">
                                <TeamLogo src={match.teams?.home?.logo} name={match.teams?.home?.name} size={48} />
                                <div className="team-info">
                                    <span className={`team-name ${homeWinner ? 'winner' : ''}`}>
                                        {match.teams?.home?.name}
                                    </span>
                                    <span className="team-country text-muted small">
                                        {match.teams?.home?.country || 'Home'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Score */}
                            <div className="match-score">
                                {match.goals?.home != null ? (
                                    <>
                                        <span className={`score-number ${homeWinner ? 'winner' : ''}`}>
                                            {homeScore}
                                        </span>
                                        <span className="score-separator">-</span>
                                        <span className={`score-number ${awayWinner ? 'winner' : ''}`}>
                                            {awayScore}
                                        </span>
                                    </>
                                ) : (
                                    <span className="score-time">{matchTime}</span>
                                )}
                            </div>

                            {/* Away Team */}
                            <div className="match-team away-team">
                                <div className="team-info text-end">
                                    <span className={`team-name ${awayWinner ? 'winner' : ''}`}>
                                        {match.teams?.away?.name}
                                    </span>
                                    <span className="team-country text-muted small">
                                        {match.teams?.away?.country || 'Away'}
                                    </span>
                                </div>
                                <TeamLogo src={match.teams?.away?.logo} name={match.teams?.away?.name} size={48} />
                            </div>
                        </div>

                        {/* Match Info */}
                        <div className="match-info mt-3">
                            <div className="info-item">
                                <FaCalendarAlt className="info-icon" />
                                <span>{matchDay}</span>
                            </div>
                            <div className="info-item">
                                <FaClock className="info-icon" />
                                <span>{matchTime}</span>
                            </div>
                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <span className="text-truncate">{match.fixture?.venue?.name || 'TBD'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

/* ===== Main Component ===== */
const LiveScores = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedLeague, setSelectedLeague] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch matches
    const fetchMatches = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        setError(null);
        
        try {
            const leagueId = selectedLeague !== 'all' ? parseInt(selectedLeague) : null;
            const response = await footballDataService.getTodayFixtures(leagueId);
            
            if (response?.response) {
                setMatches(response.response);
                setLastUpdated(new Date());
            } else {
                setMatches([]);
            }
        } catch (err) {
            console.error('Error fetching matches:', err);
            setError('Failed to load matches. Please try again.');
            
            // Use mock data as fallback
            const mockMatches = generateMockMatches();
            setMatches(mockMatches);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedLeague]);

    // Generate mock matches for demo
    const generateMockMatches = () => {
        const now = new Date();
        const matches = [];
        
        matches.push({
            fixture: { 
                id: 1, 
                date: now.toISOString(), 
                status: { short: '1H', elapsed: 35 },
                venue: { name: 'Old Trafford' }
            },
            league: { id: 39, name: 'Premier League' },
            teams: {
                home: { id: 33, name: 'Manchester United', logo: null, country: 'England' },
                away: { id: 40, name: 'Chelsea', logo: null, country: 'England' }
            },
            goals: { home: 2, away: 1 }
        });

        matches.push({
            fixture: { 
                id: 2, 
                date: now.toISOString(), 
                status: { short: '2H', elapsed: 67 },
                venue: { name: 'Santiago Bernabéu' }
            },
            league: { id: 140, name: 'La Liga' },
            teams: {
                home: { id: 78, name: 'Real Madrid', logo: null, country: 'Spain' },
                away: { id: 81, name: 'Barcelona', logo: null, country: 'Spain' }
            },
            goals: { home: 1, away: 1 }
        });

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        matches.push({
            fixture: { 
                id: 3, 
                date: yesterday.toISOString(), 
                status: { short: 'FT' },
                venue: { name: 'Allianz Arena' }
            },
            league: { id: 78, name: 'Bundesliga' },
            teams: {
                home: { id: 85, name: 'Bayern Munich', logo: null, country: 'Germany' },
                away: { id: 86, name: 'Borussia Dortmund', logo: null, country: 'Germany' }
            },
            goals: { home: 3, away: 1 }
        });

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        matches.push({
            fixture: { 
                id: 4, 
                date: tomorrow.toISOString(), 
                status: { short: 'NS' },
                venue: { name: 'San Siro' }
            },
            league: { id: 135, name: 'Serie A' },
            teams: {
                home: { id: 88, name: 'AC Milan', logo: null, country: 'Italy' },
                away: { id: 89, name: 'Inter Milan', logo: null, country: 'Italy' }
            },
            goals: { home: null, away: null }
        });

        return matches;
    };

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    // Auto-refresh every 30 seconds on live tab
    useEffect(() => {
        if (activeTab !== 'live') return;
        
        const interval = setInterval(() => {
            fetchMatches(true);
        }, 30000);
        
        return () => clearInterval(interval);
    }, [activeTab, fetchMatches]);

    // Filter matches
    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            const status = match.fixture?.status?.short;
            
            if (activeTab === 'live' && !LIVE_CODES.includes(status)) return false;
            if (activeTab === 'finished' && !FINISHED_CODES.includes(status)) return false;
            if (activeTab === 'upcoming' && !UPCOMING_CODES.includes(status)) return false;
            
            return true;
        });
    }, [matches, activeTab]);

    // Count matches by status
    const counts = useMemo(() => ({
        live: matches.filter(m => LIVE_CODES.includes(m.fixture?.status?.short)).length,
        finished: matches.filter(m => FINISHED_CODES.includes(m.fixture?.status?.short)).length,
        upcoming: matches.filter(m => UPCOMING_CODES.includes(m.fixture?.status?.short)).length,
        total: matches.length
    }), [matches]);

    // Get active league info
    const activeLeague = selectedLeague !== 'all' 
        ? LEAGUES.find(l => l.id === parseInt(selectedLeague))
        : null;

    return (
        <div className="live-scores-page">
            {/* Hero Section */}
            <div 
                className="hero-section py-5 text-white"
                style={{ 
                    background: activeLeague?.gradient || 'linear-gradient(135deg, #0a3d2e 0%, #1a472a 50%, #2d6a4f 100%)'
                }}
            >
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-md-8">
                            <div className="hero-icon-wrapper mb-3">
                                <FaFutbol className="hero-icon" />
                            </div>
                            <h1 className="display-4 fw-bold mb-3 text-danger">Live Scores</h1>
                            <p className="lead mb-4">
                                {activeLeague 
                                    ? `Follow all ${activeLeague.name} matches in real-time`
                                    : 'Follow all matches from Europe\'s top 5 leagues in real-time'
                                }
                            </p>
                            {lastUpdated && (
                                <div className="last-updated badge bg-light text-dark py-2 px-3">
                                    <FaClock className="me-2" />
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="card stats-card stats-card-total h-100">
                            <div className="card-body text-center">
                                <div className="stats-icon mb-2">📋</div>
                                <h3 className="stats-value">{counts.total}</h3>
                                <p className="stats-label">Total Matches</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card stats-card stats-card-live h-100">
                            <div className="card-body text-center">
                                <div className="stats-icon mb-2">🔴</div>
                                <h3 className="stats-value">{counts.live}</h3>
                                <p className="stats-label">Live Now</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card stats-card stats-card-upcoming h-100">
                            <div className="card-body text-center">
                                <div className="stats-icon mb-2">⏳</div>
                                <h3 className="stats-value">{counts.upcoming}</h3>
                                <p className="stats-label">Upcoming</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card stats-card stats-card-finished h-100">
                            <div className="card-body text-center">
                                <div className="stats-icon mb-2">✅</div>
                                <h3 className="stats-value">{counts.finished}</h3>
                                <p className="stats-label">Finished</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card filters-card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="filter-label">
                                    <FaFlag className="me-2" />
                                    Select League
                                </label>
                                <div className="league-filters d-flex flex-wrap gap-2">
                                    <button
                                        className={`btn btn-sm ${selectedLeague === 'all' ? 'btn-primary' : 'btn-outline-primary'} league-filter-btn`}
                                        onClick={() => setSelectedLeague('all')}
                                    >
                                        🏆 All Leagues
                                    </button>
                                    {LEAGUES.map(league => (
                                        <button
                                            key={league.id}
                                            className={`btn btn-sm ${selectedLeague === league.id.toString() ? 'btn-primary' : 'btn-outline-primary'} league-filter-btn`}
                                            onClick={() => setSelectedLeague(league.id.toString())}
                                            style={selectedLeague === league.id.toString() ? { background: league.color, borderColor: league.color } : {}}
                                        >
                                            {league.flag} {league.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="filter-label">
                                    <FaFilter className="me-2" />
                                    Filter by Status
                                </label>
                                <div className="status-filters d-flex gap-2">
                                    {[
                                        { key: 'all', label: `All (${counts.total})` },
                                        { key: 'live', label: `🔴 Live (${counts.live})` },
                                        { key: 'upcoming', label: `⏳ Upcoming (${counts.upcoming})` },
                                        { key: 'finished', label: `✅ Finished (${counts.finished})` }
                                    ].map(tab => (
                                        <button
                                            key={tab.key}
                                            className={`btn btn-sm flex-fill ${activeTab === tab.key ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setActiveTab(tab.key)}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading matches...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger text-center py-4" role="alert">
                        <h4 className="alert-heading">⚠️ Error</h4>
                        <p>{error}</p>
                        <button className="btn btn-danger" onClick={() => fetchMatches()}>
                            <FaRedoAlt className="me-2" />
                            Try Again
                        </button>
                    </div>
                ) : filteredMatches.length === 0 ? (
                    <div className="card text-center py-5">
                        <div className="card-body">
                            <div className="empty-state-icon mb-3">🏟️</div>
                            <h3>No Matches Found</h3>
                            <p className="text-muted mb-4">There are no matches matching your filters.</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => {
                                    setActiveTab('all');
                                    setSelectedLeague('all');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        {filteredMatches.map(match => (
                            <MatchCard key={match.fixture?.id} match={match} />
                        ))}
                    </div>
                )}

                {/* Refresh Button */}
                {!loading && filteredMatches.length > 0 && (
                    <div className="text-center mt-4">
                        <button 
                            className="btn btn-success refresh-btn"
                            onClick={() => fetchMatches(true)}
                            disabled={refreshing}
                        >
                            <FaRedoAlt className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh Results'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveScores;