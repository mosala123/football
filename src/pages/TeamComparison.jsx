import React, { useState, useEffect } from 'react';
import { FaBalanceScale, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import footballDataService from '../services/footballDataService';
import './TeamComparison.css';

const TeamComparison = () => {
    const [team1Id, setTeam1Id] = useState('');
    const [team2Id, setTeam2Id] = useState('');
    const [team1, setTeam1] = useState(null);
    const [team2, setTeam2] = useState(null);
    const [teamsList, setTeamsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTeams, setLoadingTeams] = useState(true);

    // جلب قائمة الفرق
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await footballDataService.getLeagueStandings(39);
                const teams = res?.response?.[0]?.standings?.[0]?.table?.map(t => ({
                    id: t.team.id,
                    name: t.team.name,
                    logo: t.team.logo
                })) || [];
                
                setTeamsList(teams);
                if (teams.length >= 2) {
                    setTeam1Id(teams[0].id);
                    setTeam2Id(teams[1].id);
                }
            } catch (err) {
                console.error('Error fetching teams:', err);
            } finally {
                setLoadingTeams(false);
            }
        };
        fetchTeams();
    }, []);

    // جلب بيانات الفريقين
    useEffect(() => {
        if (!team1Id || !team2Id) return;

        const fetchTeamData = async () => {
            setLoading(true);
            try {
                const [res1, res2] = await Promise.all([
                    footballDataService.getTeamInfo(team1Id),
                    footballDataService.getTeamInfo(team2Id)
                ]);
                
                setTeam1(res1?.response?.[0] || null);
                setTeam2(res2?.response?.[0] || null);
            } catch (err) {
                console.error('Error fetching team data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [team1Id, team2Id]);

    if (loadingTeams) {
        return (
            <div className="tc-container">
                <div className="tc-loading">
                    <div className="spinner" />
                    <p>Loading teams...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tc-container">
            {/* Header */}
            <div className="tc-header">
                <FaBalanceScale className="tc-icon" />
                <h1>Team Comparison</h1>
                <p>Select two teams to compare</p>
            </div>

            {/* Team Selection */}
            <div className="tc-selectors">
                <div className="tc-selector">
                    <label>Team 1</label>
                    <select 
                        value={team1Id} 
                        onChange={(e) => setTeam1Id(e.target.value)}
                        disabled={loading}
                    >
                        {teamsList.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <span className="tc-vs">VS</span>

                <div className="tc-selector">
                    <label>Team 2</label>
                    <select 
                        value={team2Id} 
                        onChange={(e) => setTeam2Id(e.target.value)}
                        disabled={loading}
                    >
                        {teamsList.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="tc-loading">
                    <div className="spinner" />
                    <p>Loading team data...</p>
                </div>
            )}

            {/* No Data State */}
            {!loading && (!team1 || !team2) && (
                <div className="tc-empty">
                    <p>No data available for selected teams</p>
                </div>
            )}

            {/* Team Data */}
            {!loading && team1 && team2 && (
                <>
                    {/* Team Cards */}
                    <div className="tc-cards">
                        {/* Team 1 */}
                        <div className="tc-card">
                            {team1.team?.logo && (
                                <img 
                                    src={team1.team.logo} 
                                    alt={team1.team.name} 
                                    className="tc-logo"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            
                            <h2>{team1.team?.name || 'Unknown'}</h2>
                            
                            <div className="tc-stats">
                                <div className="tc-stat-row">
                                    <span>Founded</span>
                                    <span>{team1.team?.founded || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Country</span>
                                    <span>{team1.team?.country || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Stadium</span>
                                    <span>{team1.venue?.name || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Capacity</span>
                                    <span>{team1.venue?.capacity?.toLocaleString() || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Team 2 */}
                        <div className="tc-card">
                            {team2.team?.logo && (
                                <img 
                                    src={team2.team.logo} 
                                    alt={team2.team.name} 
                                    className="tc-logo"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            
                            <h2>{team2.team?.name || 'Unknown'}</h2>
                            
                            <div className="tc-stats">
                                <div className="tc-stat-row">
                                    <span>Founded</span>
                                    <span>{team2.team?.founded || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Country</span>
                                    <span>{team2.team?.country || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Stadium</span>
                                    <span>{team2.venue?.name || 'N/A'}</span>
                                </div>
                                <div className="tc-stat-row">
                                    <span>Capacity</span>
                                    <span>{team2.venue?.capacity?.toLocaleString() || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Comparison */}
                    <div className="tc-quick-compare">
                        <h3>Quick Comparison</h3>
                        <table className="tc-compare-table">
                            <tbody>
                                <tr>
                                    <td>Founded</td>
                                    <td>{team1.team?.founded || 'N/A'}</td>
                                    <td>vs</td>
                                    <td>{team2.team?.founded || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Country</td>
                                    <td>{team1.team?.country || 'N/A'}</td>
                                    <td>vs</td>
                                    <td>{team2.team?.country || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Stadium</td>
                                    <td>{team1.venue?.name || 'N/A'}</td>
                                    <td>vs</td>
                                    <td>{team2.venue?.name || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td>Capacity</td>
                                    <td>{team1.venue?.capacity?.toLocaleString() || 'N/A'}</td>
                                    <td>vs</td>
                                    <td>{team2.venue?.capacity?.toLocaleString() || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Back to Home */}
            <div className="tc-footer">
                <Link to="/" className="tc-back">
                    <FaArrowRight /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default TeamComparison;