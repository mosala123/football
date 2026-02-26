import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaFootballBall, FaChartLine, FaTrophy, FaUsers, FaClock, 
    FaGlobeAmericas, FaFire, FaStar, FaArrowRight,
    FaCheckCircle, FaPlay, FaShieldAlt
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import footballDataService from '../services/footballDataService';
import './Home.css';

const Home = () => {
    const [liveMatches, setLiveMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [featuredMatch, setFeaturedMatch] = useState(null);
    const [stats, setStats] = useState({
        totalMatches: 0,
        totalGoals: 0,
        totalLeagues: 5
    });

    const leagues = [
        { 
            id: 39, 
            path: '/premier-league', 
            name: 'Premier League', 
            flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 
            desc: 'England', 
            color: '#3d195b', 
            bg: 'linear-gradient(135deg, #3d195b 0%, #5d2a8c 100%)',
            teams: 20,
            founded: 1992
        },
        { 
            id: 140, 
            path: '/la-liga', 
            name: 'La Liga', 
            flag: '🇪🇸', 
            desc: 'Spain', 
            color: '#ee8707', 
            bg: 'linear-gradient(135deg, #ee8707 0%, #f5a623 100%)',
            teams: 20,
            founded: 1929
        },
        { 
            id: 135, 
            path: '/serie-a', 
            name: 'Serie A', 
            flag: '🇮🇹', 
            desc: 'Italy', 
            color: '#024494', 
            bg: 'linear-gradient(135deg, #024494 0%, #0369a1 100%)',
            teams: 20,
            founded: 1898
        },
        { 
            id: 78, 
            path: '/bundesliga', 
            name: 'Bundesliga', 
            flag: '🇩🇪', 
            desc: 'Germany', 
            color: '#d20515', 
            bg: 'linear-gradient(135deg, #d20515 0%, #dc2626 100%)',
            teams: 18,
            founded: 1963
        },
        { 
            id: 61, 
            path: '/ligue-1', 
            name: 'Ligue 1', 
            flag: '🇫🇷', 
            desc: 'France', 
            color: '#dae025', 
            bg: 'linear-gradient(135deg, #dae025 0%, #cdc02c 100%)',
            teams: 18,
            founded: 1932
        }
    ];

    const features = [
        {
            icon: <FaFire />,
            title: 'Live Scores',
            desc: 'Real-time match updates from all major leagues',
            color: '#ef4444'
        },
        {
            icon: <FaChartLine />,
            title: 'Live Statistics',
            desc: 'In-depth match stats and player performance',
            color: '#14f195'
        },
        {
            icon: <FaTrophy />,
            title: 'League Standings',
            desc: 'Updated tables from 5 major European leagues',
            color: '#f59e0b'
        },
        {
            icon: <FaUsers />,
            title: 'Team Profiles',
            desc: 'Complete information about your favorite clubs',
            color: '#3b82f6'
        },
        {
            icon: <FaStar />,
            title: 'Top Scorers',
            desc: 'Track the best goal scorers in each league',
            color: '#8b5cf6'
        },
        {
            icon: <FaClock />,
            title: 'Match History',
            desc: 'Past results and head-to-head records',
            color: '#ec4899'
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch live matches
                const fixturesData = await footballDataService.getTodayFixtures();
                if (fixturesData?.response) {
                    setLiveMatches(fixturesData.response.slice(0, 3));
                    if (fixturesData.response.length > 0) {
                        setFeaturedMatch(fixturesData.response[0]);
                    }
                    
                    // Calculate total matches and goals
                    const totalMatches = fixturesData.response.length;
                    const totalGoals = fixturesData.response.reduce((sum, match) => 
                        sum + (match.goals?.home || 0) + (match.goals?.away || 0), 0
                    );
                    
                    setStats(prev => ({ 
                        ...prev, 
                        totalMatches,
                        totalGoals 
                    }));
                }
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Unable to load live data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        // Refresh data every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content container">
                    <h1 className="hero-title  text-light">
                        <FaFootballBall className="hero-icon" />
                        MyFootball
                    </h1>
                    <p className="hero-subtitle">Your Ultimate European Football Hub</p>
                    <p className="hero-description">
                        Track live scores, standings, top scorers & team info from 5 major European leagues.
                        Real-time updates, comprehensive statistics, and an amazing community of football fans.
                    </p>
                    
                    {/* Quick Stats - Dynamic */}
                    <div className="hero-stats mb-4">
                        <div className="stat-item">
                            <span className="stat-value text-primary fw-bold fs-4">{stats.totalMatches}</span>
                            <span className="stat-label text-light">Today's Matches</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value text-primary fw-bold fs-4">{stats.totalGoals}</span>
                            <span className="stat-label text-light">Goals Today</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value text-primary fw-bold fs-4">{stats.totalLeagues}</span>
                            <span className="stat-label text-light">Top Leagues</span>
                        </div>
                    </div>

                    <div className="hero-buttons">
                        <Link to="/live-scores" className="btn btn-primary btn-lg">
                            <FaClock className="me-2" /> Live Matches
                        </Link>
                        <Link to="/top-scorers" className="btn btn-outline-light btn-lg">
                            <FaTrophy className="me-2" /> Top Scorers
                        </Link>
                    </div>
                </div>
            </section>

            {/* Error Message */}
            {error && (
                <div className="container mt-3">
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <FaShieldAlt className="me-2" />
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading latest matches...</p>
                </div>
            ) : (
                <>
                    {/* Featured Match - Only if available */}
                    {featuredMatch && (
                        <section className="featured-match py-5">
                            <div className="container">
                                <div className="row align-items-center">
                                    <div className="col-lg-6">
                                        <div className="featured-content">
                                            {featuredMatch.fixture?.status?.short === '1H' || 
                                             featuredMatch.fixture?.status?.short === '2H' ? (
                                                <span className="featured-badge">🔴 LIVE NOW</span>
                                            ) : (
                                                <span className="featured-badge-upcoming">⏳ UPCOMING</span>
                                            )}
                                            <h2>Featured Match</h2>
                                            <p className="featured-league">{featuredMatch.league?.name}</p>
                                            <div className="featured-teams">
                                                <div className="featured-team">
                                                    <img 
                                                        src={featuredMatch.teams?.home?.logo} 
                                                        alt={featuredMatch.teams?.home?.name}
                                                        className="featured-logo"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/80?text=Team';
                                                        }}
                                                    />
                                                    <span className="featured-team-name">{featuredMatch.teams?.home?.name}</span>
                                                </div>
                                                <div className="featured-score">
                                                    <span className="score-number">{featuredMatch.goals?.home ?? 0}</span>
                                                    <span className="score-separator">-</span>
                                                    <span className="score-number">{featuredMatch.goals?.away ?? 0}</span>
                                                </div>
                                                <div className="featured-team">
                                                    <img 
                                                        src={featuredMatch.teams?.away?.logo} 
                                                        alt={featuredMatch.teams?.away?.name}
                                                        className="featured-logo"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/80?text=Team';
                                                        }}
                                                    />
                                                    <span className="featured-team-name">{featuredMatch.teams?.away?.name}</span>
                                                </div>
                                            </div>
                                            <Link to={`/match/${featuredMatch.fixture?.id}`} className="btn btn-outline-primary mt-4">
                                                Match Details <FaArrowRight className="ms-2" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="featured-stats">
                                            <h3>Match Information</h3>
                                            <div className="stat-bars">
                                                <div className="stat-bar-item">
                                                    <span>Status</span>
                                                    <div className="status-display">
                                                        {featuredMatch.fixture?.status?.long} 
                                                        {featuredMatch.fixture?.status?.elapsed && ` (${featuredMatch.fixture.status.elapsed}')`}
                                                    </div>
                                                </div>
                                                <div className="stat-bar-item">
                                                    <span>Venue</span>
                                                    <div className="venue-display">
                                                        {featuredMatch.fixture?.venue?.name || 'TBD'}
                                                    </div>
                                                </div>
                                                <div className="stat-bar-item">
                                                    <span>Date</span>
                                                    <div className="date-display">
                                                        {new Date(featuredMatch.fixture?.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Live Matches Preview */}
                    {liveMatches.length > 0 && (
                        <section className="live-matches-preview py-5">
                            <div className="container">
                                <div className="section-header">
                                    <h2 className="section-title">
                                        <FaFire className="title-icon" /> Live & Upcoming Matches
                                    </h2>
                                    <Link to="/live-scores" className="view-all-link">
                                        View All <FaArrowRight />
                                    </Link>
                                </div>
                                <div className="row g-4">
                                    {liveMatches.map(match => (
                                        <div key={match.fixture?.id} className="col-lg-4">
                                            <Link to={`/match/${match.fixture?.id}`} className="match-card-link">
                                                <div className={`match-card ${match.fixture?.status?.short === '1H' || match.fixture?.status?.short === '2H' ? 'live' : ''}`}>
                                                    <div className="match-header">
                                                        <span className="match-league">
                                                            <FaShieldAlt className="me-1" /> {match.league?.name}
                                                        </span>
                                                        <span className={`match-status status-${match.fixture?.status?.short}`}>
                                                            {match.fixture?.status?.short === '1H' && '🔴 LIVE'}
                                                            {match.fixture?.status?.short === '2H' && '🔴 LIVE'}
                                                            {match.fixture?.status?.short === 'FT' && '✅ FT'}
                                                            {match.fixture?.status?.short === 'NS' && '⏳ Upcoming'}
                                                        </span>
                                                    </div>
                                                    <div className="match-body">
                                                        <div className="match-team home">
                                                            <img 
                                                                src={match.teams?.home?.logo} 
                                                                alt="" 
                                                                className="team-logo"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/35?text=Team';
                                                                }}
                                                            />
                                                            <span className="team-name">{match.teams?.home?.name}</span>
                                                        </div>
                                                        <div className="match-score">
                                                            <span className="score">{match.goals?.home ?? 0}</span>
                                                            <span className="separator">-</span>
                                                            <span className="score">{match.goals?.away ?? 0}</span>
                                                        </div>
                                                        <div className="match-team away">
                                                            <span className="team-name">{match.teams?.away?.name}</span>
                                                            <img 
                                                                src={match.teams?.away?.logo} 
                                                                alt="" 
                                                                className="team-logo"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/35?text=Team';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="match-footer">
                                                        <span className="match-time">
                                                            <FaClock className="me-1" />
                                                            {new Date(match.fixture?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="match-venue">{match.fixture?.venue?.name || 'TBD'}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Features Section */}
                    <section className="features-section py-5">
                        <div className="container">
                            <h2 className="section-title text-center mb-5">
                                Why Choose MyFootball?
                            </h2>
                            <div className="row g-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="col-md-6 col-lg-4">
                                        <div className="feature-card">
                                            <div className="feature-icon" style={{ background: feature.color }}>
                                                {feature.icon}
                                            </div>
                                            <h3>{feature.title}</h3>
                                            <p>{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Leagues Cards */}
                    <section className="leagues-section py-5">
                        <div className="container">
                            <h2 className="section-title text-center mb-5">
                                Major European Leagues
                            </h2>
                            <div className="row g-4">
                                {leagues.map(league => (
                                    <div key={league.id} className="col-lg-4 col-md-6">
                                        <Link to={league.path} className="league-card-link">
                                            <div className="league-card" style={{ borderColor: league.color }}>
                                                <div className="league-header" style={{ background: league.bg }}>
                                                    <span className="league-flag">{league.flag}</span>
                                                </div>
                                                <div className="league-body">
                                                    <h3>{league.name}</h3>
                                                    <p className="league-desc">{league.desc}</p>
                                                    <div className="league-stats">
                                                        <div className="stat">
                                                            <span className="stat-label">Teams</span>
                                                            <span className="stat-value">{league.teams}</span>
                                                        </div>
                                                        <div className="stat">
                                                            <span className="stat-label">Founded</span>
                                                            <span className="stat-value">{league.founded}</span>
                                                        </div>
                                                    </div>
                                                    <span className="btn-view">
                                                        View Standings <FaArrowRight />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="cta-section py-5">
                        <div className="container text-center">
                            <h2 className="cta-title text-light">Ready to Start Your Football Journey ?</h2>
                            <p className="cta-text">
                                Join thousands of football fans who trust MyFootball for live scores, 
                                statistics, and updates. It's free and always will be!
                            </p>
                            <div className="cta-buttons">
                                <Link to="/live-scores" className="btn btn-light btn-lg me-3">
                                    <FaPlay className="me-2" /> Get Started
                                </Link>
                                <Link to="/premier-league" className="btn btn-outline-light btn-lg">
                                    Explore Leagues
                                </Link>
                            </div>
                            <div className="cta-features mt-4">
                                <span className="feature-badge">
                                    <FaCheckCircle /> No Credit Card
                                </span>
                                <span className="feature-badge">
                                    <FaCheckCircle /> Free Forever
                                </span>
                                <span className="feature-badge">
                                    <FaCheckCircle /> Instant Access
                                </span>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;