import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { FaFootballBall, FaTrophy, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaGlobe, FaChartLine, FaStar, FaFutbol } from "react-icons/fa";
import footballDataService from "../../services/footballDataService";
import imageclibdetails from "../../images/imageclibdetails.png";
import imagecoatsh from "../../images/coatch.png";
import "./ClubDetails.css";

const ClubDetails = () => {
    const { clubId } = useParams();
    const [club, setClub] = useState(null);
    const [standings, setStandings] = useState([]);
    const [recentMatches, setRecentMatches] = useState([]);
    const [topScorers, setTopScorers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // ألوان افتراضية للنادي (يمكن تخصيصها لكل نادي)
    const teamColors = useMemo(() => {
        const colors = {
            'Manchester United': { primary: '#da291c', secondary: '#f9a01b' },
            'Liverpool': { primary: '#c8102e', secondary: '#ffd700' },
            'Arsenal': { primary: '#db0007', secondary: '#9c824a' },
            'Chelsea': { primary: '#034694', secondary: '#ba8b3a' },
            'Manchester City': { primary: '#6cabdd', secondary: '#1c2b39' },
            'Real Madrid': { primary: '#febd11', secondary: '#00529f' },
            'Barcelona': { primary: '#a50044', secondary: '#004d98' },
            'Bayern Munich': { primary: '#dc052d', secondary: '#0066b2' },
            'Paris Saint-Germain': { primary: '#004170', secondary: '#da291c' },
            'Juventus': { primary: '#000000', secondary: '#ffffff' },
            'AC Milan': { primary: '#fb0909', secondary: '#000000' },
            'Inter Milan': { primary: '#0066b2', secondary: '#000000' }
        };
        
        const teamName = club?.team?.name || '';
        return colors[teamName] || { primary: '#40e0d0', secondary: '#2d6a4f' };
    }, [club]);

    useEffect(() => {
        const fetchClubData = async () => {
            setLoading(true);
            setError(null);
            try {
                // جلب معلومات النادي
                const teamRes = await footballDataService.getTeamInfo(clubId);
                if (teamRes?.response?.[0]) {
                    setClub(teamRes.response[0]);
                    
                    // جلب ترتيب الدوري (سنفترض أن النادي في الدوري الإنجليزي)
                    const leagueId = 39; // Premier League
                    const standingsRes = await footballDataService.getLeagueStandings(leagueId);
                    if (standingsRes?.response?.[0]?.standings?.[0]?.table) {
                        setStandings(standingsRes.response[0].standings[0].table);
                    }
                    
                    // جلب آخر المباريات
                    setRecentMatches([
                        {
                            id: 1,
                            competition: 'Premier League',
                            homeTeam: { name: teamRes.response[0].team.name, logo: teamRes.response[0].team.logo },
                            awayTeam: { name: 'Arsenal', logo: 'https://via.placeholder.com/50' },
                            homeScore: 2,
                            awayScore: 1,
                            date: '2024-03-20',
                            status: 'FT'
                        },
                        {
                            id: 2,
                            competition: 'Premier League',
                            homeTeam: { name: 'Chelsea', logo: 'https://via.placeholder.com/50' },
                            awayTeam: { name: teamRes.response[0].team.name, logo: teamRes.response[0].team.logo },
                            homeScore: 1,
                            awayScore: 1,
                            date: '2024-03-16',
                            status: 'FT'
                        },
                        {
                            id: 3,
                            competition: 'Premier League',
                            homeTeam: { name: teamRes.response[0].team.name, logo: teamRes.response[0].team.logo },
                            awayTeam: { name: 'Liverpool', logo: 'https://via.placeholder.com/50' },
                            homeScore: 0,
                            awayScore: 2,
                            date: '2024-03-09',
                            status: 'FT'
                        }
                    ]);
                    
                    // جلب أفضل الهدافين (بيانات تجريبية)
                    setTopScorers([
                        { name: 'Marcus Rashford', goals: 15, assists: 5, image: null },
                        { name: 'Bruno Fernandes', goals: 12, assists: 8, image: null },
                        { name: 'Rasmus Højlund', goals: 8, assists: 3, image: null },
                        { name: 'Alejandro Garnacho', goals: 6, assists: 4, image: null },
                        { name: 'Scott McTominay', goals: 5, assists: 2, image: null }
                    ]);
                }
            } catch (err) {
                console.error("Error fetching club data:", err);
                setError("Failed to load club data");
            } finally {
                setLoading(false);
            }
        };

        if (clubId) {
            fetchClubData();
        }
    }, [clubId]);

    // إيجاد ترتيب النادي في الدوري
    const clubStanding = useMemo(() => {
        if (!standings.length || !club) return null;
        return standings.find(t => t.team?.name === club.team?.name);
    }, [standings, club]);

    // إحصائيات سريعة
    const quickStats = useMemo(() => {
        if (!clubStanding) return null;
        
        return {
            position: clubStanding.rank,
            points: clubStanding.points,
            played: clubStanding.all?.played || 0,
            won: clubStanding.all?.win || 0,
            drawn: clubStanding.all?.draw || 0,
            lost: clubStanding.all?.lose || 0,
            goalsFor: clubStanding.all?.goals?.for || 0,
            goalsAgainst: clubStanding.all?.goals?.against || 0,
            goalDiff: clubStanding.goalsDiff || 0
        };
    }, [clubStanding]);

    if (loading) {
        return (
            <div className="club-details-container loading">
                <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem', color: '#40e0d0' }} />
                <h5>Loading club details...</h5>
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="club-details-container">
                <div className="alert alert-danger text-center m-5">
                    <h4>❌ Error</h4>
                    <p>{error || 'Club not found'}</p>
                    <Link to="/" className="btn btn-outline-danger mt-3">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="club-details-container">
            {/* Hero Section */}
            <div className="club-hero" style={{ 
                background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`
            }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    {club.team?.logo && (
                        <img src={club.team.logo} alt={club.team.name} className="club-logo-hero" />
                    )}
                    <h1>{club.team?.name}</h1>
                    <p className="club-country">{club.team?.country}</p>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <FaCalendarAlt />
                            <span>Founded: {club.team?.founded || 'N/A'}</span>
                        </div>
                        <div className="hero-stat">
                            <FaMapMarkerAlt />
                            <span>{club.venue?.name || 'N/A'}</span>
                        </div>
                        <div className="hero-stat">
                            <FaUsers />
                            <span>Capacity: {club.venue?.capacity?.toLocaleString() || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            {quickStats && (
                <div className="quick-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div>
                            <h3>Position</h3>
                            <p>{quickStats.position}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div>
                            <h3>Points</h3>
                            <p>{quickStats.points}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚽</div>
                        <div>
                            <h3>Goals For</h3>
                            <p>{quickStats.goalsFor}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🛡️</div>
                        <div>
                            <h3>Goals Against</h3>
                            <p>{quickStats.goalsAgainst}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="club-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ borderColor: teamColors.primary }}
                >
                    📋 Overview
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
                    onClick={() => setActiveTab('matches')}
                    style={{ borderColor: teamColors.primary }}
                >
                    ⚡ Recent Matches
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'squad' ? 'active' : ''}`}
                    onClick={() => setActiveTab('squad')}
                    style={{ borderColor: teamColors.primary }}
                >
                    👥 Squad
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('standings')}
                    style={{ borderColor: teamColors.primary }}
                >
                    📊 League Table
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="info-grid">
                            <div className="info-card">
                                <h3>🏟️ Stadium</h3>
                                <div className="info-content">
                                    <p><strong>Name:</strong> {club.venue?.name || 'N/A'}</p>
                                    <p><strong>Capacity:</strong> {club.venue?.capacity?.toLocaleString() || 'N/A'}</p>
                                    <p><strong>Address:</strong> {club.venue?.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>🏆 Achievements</h3>
                                <div className="achievements-list">
                                    <div className="achievement-item">
                                        <span className="achievement-icon">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                                        <span>Premier League: 20</span>
                                    </div>
                                    <div className="achievement-item">
                                        <span className="achievement-icon">🏆</span>
                                        <span>FA Cup: 12</span>
                                    </div>
                                    <div className="achievement-item">
                                        <span className="achievement-icon">🇪🇺</span>
                                        <span>Champions League: 3</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <h3>📊 Season Stats</h3>
                                {quickStats && (
                                    <div className="stats-grid">
                                        <div className="stat-item">
                                            <span className="stat-label">Played</span>
                                            <span className="stat-value">{quickStats.played}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Won</span>
                                            <span className="stat-value win">{quickStats.won}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Drawn</span>
                                            <span className="stat-value draw">{quickStats.drawn}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">Lost</span>
                                            <span className="stat-value loss">{quickStats.lost}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">GF</span>
                                            <span className="stat-value">{quickStats.goalsFor}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-label">GA</span>
                                            <span className="stat-value">{quickStats.goalsAgainst}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Matches Tab */}
                {activeTab === 'matches' && (
                    <div className="matches-tab">
                        <h3>⚡ Recent Matches</h3>
                        <div className="matches-list">
                            {recentMatches.map(match => (
                                <Link key={match.id} to={`/match/${match.id}`} className="match-card-link">
                                    <div className="match-card">
                                        <div className="match-header">
                                            <span className="match-competition">{match.competition}</span>
                                            <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="match-body">
                                            <div className="match-team-info">
                                                <img src={match.homeTeam.logo} alt={match.homeTeam.name} />
                                                <span className={match.homeScore > match.awayScore ? 'winner' : ''}>
                                                    {match.homeTeam.name}
                                                </span>
                                            </div>
                                            <div className="match-score">
                                                <span className="score">{match.homeScore}</span>
                                                <span className="dash">-</span>
                                                <span className="score">{match.awayScore}</span>
                                            </div>
                                            <div className="match-team-info">
                                                <img src={match.awayTeam.logo} alt={match.awayTeam.name} />
                                                <span className={match.awayScore > match.homeScore ? 'winner' : ''}>
                                                    {match.awayTeam.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Squad Tab */}
                {activeTab === 'squad' && (
                    <div className="squad-tab">
                        <h3>👥 Top Scorers This Season</h3>
                        <div className="squad-grid">
                            {topScorers.map((player, index) => (
                                <div key={index} className="player-card">
                                    <div className="player-rank">{index + 1}</div>
                                    <div className="player-avatar">
                                        {player.image ? (
                                            <img src={player.image} alt={player.name} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {player.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="player-info">
                                        <h4>{player.name}</h4>
                                        <div className="player-stats">
                                            <span className="stat">
                                                <FaFutbol /> {player.goals}
                                            </span>
                                            <span className="stat">
                                                <FaStar /> {player.assists}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Standings Tab */}
                {activeTab === 'standings' && (
                    <div className="standings-tab">
                        <h3>📊 League Table</h3>
                        <div className="table-responsive">
                            <table className="table standings-table">
                                <thead>
                                    <tr>
                                        <th>Pos</th>
                                        <th>Team</th>
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
                                    {standings.map((team, index) => (
                                        <tr key={index} className={team.team?.name === club.team?.name ? 'current-team' : ''}>
                                            <td>{team.rank || index + 1}</td>
                                            <td>
                                                <div className="team-cell">
                                                    {team.team?.logo && (
                                                        <img src={team.team.logo} alt={team.team.name} className="team-logo" />
                                                    )}
                                                    <span>{team.team?.name}</span>
                                                </div>
                                            </td>
                                            <td>{team.all?.played || 0}</td>
                                            <td>{team.all?.win || 0}</td>
                                            <td>{team.all?.draw || 0}</td>
                                            <td>{team.all?.lose || 0}</td>
                                            <td>{team.all?.goals?.for || 0}</td>
                                            <td>{team.all?.goals?.against || 0}</td>
                                            <td className={team.goalsDiff > 0 ? 'positive' : team.goalsDiff < 0 ? 'negative' : ''}>
                                                {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff || 0}
                                            </td>
                                            <td><strong>{team.points || 0}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClubDetails;