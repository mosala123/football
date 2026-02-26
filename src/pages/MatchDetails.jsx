import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import footballDataService from '../services/footballDataService';
import './MatchDetails.css';

const MatchDetails = () => {
    const { matchId } = useParams();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('events');

    useEffect(() => {
        let isMounted = true;
        const fetchMatchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // جلب تفاصيل المباراة الأساسية
                const response = await footballDataService.getFixtureDetails(matchId);
                if (isMounted && response?.response?.length > 0) {
                    const fixture = response.response[0];
                    // جلب الأحداث والإحصائيات (قد تكون mock)
                    const [eventsRes, statsRes] = await Promise.allSettled([
                        footballDataService.getFixtureEvents(matchId),
                        footballDataService.getFixtureStatistics(matchId)
                    ]);
                    setMatch({
                        ...fixture,
                        events: eventsRes.status === 'fulfilled' ? eventsRes.value.response : [],
                        statistics: statsRes.status === 'fulfilled' ? statsRes.value.response : []
                    });
                } else {
                    setError('Match not found');
                }
            } catch (err) {
                setError('Failed to load match details');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchMatchDetails();
        return () => { isMounted = false; };
    }, [matchId]);

    // تجهيز بيانات الفريقين للعرض
    const homeTeam = useMemo(() => match?.teams?.home, [match]);
    const awayTeam = useMemo(() => match?.teams?.away, [match]);
    const fixture = useMemo(() => match?.fixture, [match]);
    const league = useMemo(() => match?.league, [match]);

    // فلترة الأحداث حسب الفريق للعرض المنظم
    const homeEvents = useMemo(() => match?.events?.filter(e => e.team?.id === homeTeam?.id) || [], [match, homeTeam]);
    const awayEvents = useMemo(() => match?.events?.filter(e => e.team?.id === awayTeam?.id) || [], [match, awayTeam]);

    // استخراج الإحصائيات (إذا وجدت)
    const homeStats = useMemo(() => {
        if (!match?.statistics) return null;
        return match.statistics.find(s => s.team?.id === homeTeam?.id)?.statistics || [];
    }, [match, homeTeam]);
    const awayStats = useMemo(() => {
        if (!match?.statistics) return null;
        return match.statistics.find(s => s.team?.id === awayTeam?.id)?.statistics || [];
    }, [match, awayTeam]);

    // دالة مساعدة لاستخراج قيمة إحصائية معينة
    const getStatValue = (stats, type) => {
        const stat = stats?.find(s => s.type === type);
        return stat?.value !== undefined ? stat.value : 0;
    };

    if (loading) {
        return (
            <div className="match-details-container loading">
                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} />
                <h5>Loading match details...</h5>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="match-details-container">
                <div className="alert alert-danger text-center m-5">
                    <h4>❌ Error</h4>
                    <p>{error || 'Match not found'}</p>
                    <button className="btn btn-outline-danger mt-3" onClick={() => window.history.back()}>Go Back</button>
                </div>
            </div>
        );
    }

    const date = fixture?.date ? new Date(fixture.date) : null;
    const formattedDate = date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD';
    const formattedTime = date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Time TBD';

    return (
        <div className="match-details-container">
            {/* Header */}
            <div className="match-header">
                <div className="match-title">
                    <div className="team-header">
                        <div className="team-logo-name">
                            {homeTeam?.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="team-logo-img" />}
                            <span>{homeTeam?.name}</span>
                        </div>
                        <span className="match-vs">VS</span>
                        <div className="team-logo-name">
                            {awayTeam?.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="team-logo-img" />}
                            <span>{awayTeam?.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Section */}
            <div className="score-section">
                <div className="team-score home">
                    <h2>{homeTeam?.name}</h2>
                    <div className="display-score">
                        <span className="score">{match.goals?.home ?? 0}</span>
                        {homeStats && (
                            <span className="formation">{getStatValue(homeStats, 'Formation') || 'N/A'}</span>
                        )}
                    </div>
                </div>

                <div className="vs-separator">
                    <span className="vs-text">VS</span>
                    <p className="match-date">{formattedDate} - {formattedTime}</p>
                    <p className={`match-status badge ${fixture?.status?.short === 'FT' ? 'bg-secondary' : 'bg-success'}`}>
                        {fixture?.status?.long || 'Status'}
                    </p>
                </div>

                <div className="team-score away">
                    <h2>{awayTeam?.name}</h2>
                    <div className="display-score">
                        <span className="score">{match.goals?.away ?? 0}</span>
                        {awayStats && (
                            <span className="formation">{getStatValue(awayStats, 'Formation') || 'N/A'}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Match Info Bar */}
            <div className="match-info-bar">
                <div className="info-item">
                    <span className="info-label">📍 Stadium</span>
                    <span className="info-value">{fixture?.venue?.name || 'Unknown'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">👥 Attendance</span>
                    <span className="info-value">{fixture?.attendance?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">⏱️ Duration</span>
                    <span className="info-value">{fixture?.status?.elapsed ? `${fixture.status.elapsed}'` : '90 min'}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">🏆 League</span>
                    <span className="info-value">{league?.name || 'N/A'}</span>
                </div>
            </div>

            {/* Tabs Navigation */}
            <ul className="nav nav-tabs details-tabs" role="tablist">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                        🎬 Match Events
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                        📊 Statistics
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'lineup' ? 'active' : ''}`} onClick={() => setActiveTab('lineup')}>
                        👥 Lineup
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Events Tab */}
                {activeTab === 'events' && (
                    <div className="events-section">
                        <h3>Match Events</h3>
                        {match.events?.length === 0 ? (
                            <p className="text-muted text-center">No events available</p>
                        ) : (
                            <div className="timeline">
                                {/* عرض الأحداث مجمعة حسب الوقت */}
                                {match.events?.sort((a, b) => (a.time?.elapsed || 0) - (b.time?.elapsed || 0)).map((event, idx) => {
                                    const isHome = event.team?.id === homeTeam?.id;
                                    return (
                                        <div key={idx} className={`timeline-event ${isHome ? 'home' : 'away'}`}>
                                            <div className="event-time">
                                                <span className="minute">{event.time?.elapsed || '?'}'</span>
                                                {event.time?.extra && <span className="extra">+{event.time.extra}</span>}
                                            </div>
                                            <div className={`event-marker ${isHome ? 'home' : 'away'}`}>
                                                <span className="marker-icon">
                                                    {event.type === 'Goal' ? '⚽' : event.type === 'Card' ? '🟨' : event.type === 'subst' ? '🔄' : '📌'}
                                                </span>
                                            </div>
                                            <div className="event-details">
                                                <p className="event-player">{event.player?.name || 'Unknown'}</p>
                                                <p className="event-desc">{event.detail || event.type}</p>
                                                <p className="event-team">{event.team?.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="stats-section">
                        <h3>Match Statistics</h3>
                        {!homeStats || !awayStats ? (
                            <p className="text-muted text-center">No statistics available</p>
                        ) : (
                            <div className="stats-comparison">
                                {/* حلق على الإحصائيات المهمة */}
                                {['Ball Possession', 'Total Shots', 'Shots on Target', 'Passes', 'Tackles', 'Fouls', 'Yellow Cards', 'Corners'].map(statType => {
                                    const homeVal = getStatValue(homeStats, statType);
                                    const awayVal = getStatValue(awayStats, statType);
                                    const total = homeVal + awayVal;
                                    const homePercent = total ? (homeVal / total) * 100 : 50;
                                    return (
                                        <div key={statType} className="stat-row">
                                            <div className="team-stat home">
                                                <span className="stat-value">{homeVal}</span>
                                                <span className="stat-label">{statType}</span>
                                            </div>
                                            <div className="stat-bar">
                                                <div className="stat-progress home" style={{ width: `${homePercent}%` }} />
                                                <div className="stat-progress away" style={{ width: `${100 - homePercent}%` }} />
                                            </div>
                                            <div className="team-stat away">
                                                <span className="stat-value">{awayVal}</span>
                                                <span className="stat-label">{statType}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Lineup Tab */}
                {activeTab === 'lineup' && (
                    <div className="lineup-section">
                        <h3>Starting Lineup</h3>
                        {!match.lineups ? (
                            <p className="text-muted text-center">No lineup data available</p>
                        ) : (
                            <div className="lineups-container">
                                {/* Home Team Lineup */}
                                <div className="team-lineup home">
                                    <h4>{homeTeam?.name}</h4>
                                    <div className="formation-display">
                                        {getStatValue(homeStats, 'Formation') || 'N/A'}
                                    </div>
                                    <div className="players-list">
                                        {match.lineups?.filter(l => l.team?.id === homeTeam?.id)[0]?.startXI?.map(player => (
                                            <div key={player.player?.id} className="player-box">
                                                <div className="player-number">{player.player?.number || '?'}</div>
                                                <div className="player-details">
                                                    <p className="player-name">{player.player?.name}</p>
                                                    <p className="player-position">{player.player?.pos}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Away Team Lineup */}
                                <div className="team-lineup away">
                                    <h4>{awayTeam?.name}</h4>
                                    <div className="formation-display">
                                        {getStatValue(awayStats, 'Formation') || 'N/A'}
                                    </div>
                                    <div className="players-list">
                                        {match.lineups?.filter(l => l.team?.id === awayTeam?.id)[0]?.startXI?.map(player => (
                                            <div key={player.player?.id} className="player-box">
                                                <div className="player-number">{player.player?.number || '?'}</div>
                                                <div className="player-details">
                                                    <p className="player-name">{player.player?.name}</p>
                                                    <p className="player-position">{player.player?.pos}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchDetails;