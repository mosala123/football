import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaHeart, FaRegHeart, FaFutbol, FaTrophy, FaStar, 
    FaFire, FaPlus, FaSearch, FaFilter, FaTimes,
    FaArrowRight, FaCheckCircle, FaInfoCircle, FaThList,
    FaThLarge, FaRedoAlt, FaTrash, FaExclamationTriangle
} from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import footballDataService from '../services/footballDataService';
import './Favorites.css';

const Favorites = () => {
    const { favoriteTeams, favoriteLeagues, toggleFavoriteTeam, toggleFavoriteLeague } = useFavorites();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeague, setSelectedLeague] = useState('all');
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [teamSearch, setTeamSearch] = useState('');
    const [selectedLeagueFilter, setSelectedLeagueFilter] = useState('all');
    
    // حالات التأكيد
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'team' or 'league'

    // قائمة الدوريات المتاحة
    const leagues = useMemo(() => [
        { id: 39, name: 'Premier League', flag: '🇬🇧', country: 'England', color: '#3d195b', gradient: 'linear-gradient(135deg, #3d195b 0%, #5d2a8c 100%)' },
        { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain', color: '#ee8707', gradient: 'linear-gradient(135deg, #ee8707 0%, #f5a623 100%)' },
        { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy', color: '#024494', gradient: 'linear-gradient(135deg, #024494 0%, #0369a1 100%)' },
        { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany', color: '#d20515', gradient: 'linear-gradient(135deg, #d20515 0%, #dc2626 100%)' },
        { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France', color: '#dae025', gradient: 'linear-gradient(135deg, #dae025 0%, #cdc02c 100%)' }
    ], []);

    // جلب الفرق المتاحة من كل الدوريات
    useEffect(() => {
        const fetchAllTeams = async () => {
            setLoading(true);
            try {
                const allTeams = [];
                
                // جلب فرق من كل دوري
                for (const league of leagues) {
                    const res = await footballDataService.getLeagueStandings(league.id);
                    const teams = res?.response?.[0]?.standings?.[0]?.table?.map(t => ({
                        id: t.team.id.toString(),
                        name: t.team.name,
                        logo: t.team.logo,
                        country: league.country,
                        league: league.name,
                        leagueId: league.id,
                        leagueFlag: league.flag,
                        leagueColor: league.color,
                        founded: t.team.founded || 'N/A',
                        stadium: t.venue?.name || 'N/A',
                        position: t.rank || 0,
                        points: t.points || 0
                    })) || [];
                    
                    allTeams.push(...teams);
                }
                
                setAvailableTeams(allTeams);
            } catch (err) {
                console.error('Error fetching teams:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllTeams();
    }, []);

    // تصفية الفرق المتاحة للاختيار
    const filteredAvailableTeams = useMemo(() => {
        return availableTeams
            .filter(team => {
                const matchesSearch = team.name.toLowerCase().includes(teamSearch.toLowerCase());
                const matchesLeague = selectedLeagueFilter === 'all' || team.leagueId === parseInt(selectedLeagueFilter);
                const notAdded = !favoriteTeams.some(t => t.id === team.id);
                return matchesSearch && matchesLeague && notAdded;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [availableTeams, teamSearch, selectedLeagueFilter, favoriteTeams]);

    // إضافة فرق محددة
    const handleAddSelectedTeams = () => {
        selectedTeams.forEach(teamId => {
            const team = availableTeams.find(t => t.id === teamId);
            if (team) {
                toggleFavoriteTeam(team.id, {
                    name: team.name,
                    logo: team.logo,
                    country: team.country,
                    leagueId: team.leagueId,
                    leagueName: team.league,
                    leagueFlag: team.leagueFlag
                });
            }
        });
        setSelectedTeams([]);
        setTeamSearch('');
    };

    // تحديد/إلغاء تحديد كل الفرق
    const toggleSelectAll = () => {
        if (selectedTeams.length === filteredAvailableTeams.length) {
            setSelectedTeams([]);
        } else {
            setSelectedTeams(filteredAvailableTeams.map(t => t.id));
        }
    };

    // فتح نافذة تأكيد الحذف
    const confirmDelete = (item, type) => {
        setItemToDelete(item);
        setDeleteType(type);
        setShowDeleteConfirm(true);
    };

    // تنفيذ الحذف بعد التأكيد
    const handleConfirmDelete = () => {
        if (deleteType === 'team' && itemToDelete) {
            toggleFavoriteTeam(itemToDelete.id);
        } else if (deleteType === 'league' && itemToDelete) {
            toggleFavoriteLeague(itemToDelete.id);
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    // إلغاء الحذف
    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        setDeleteType(null);
    };

    // تصفية العناصر المفضلة
    const filteredFavorites = useMemo(() => {
        let teams = favoriteTeams;
        let leagues_items = favoriteLeagues;

        if (activeTab === 'teams') leagues_items = [];
        if (activeTab === 'leagues') teams = [];

        if (searchTerm) {
            teams = teams.filter(t => 
                t.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            leagues_items = leagues_items.filter(l => 
                l.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedLeague !== 'all') {
            teams = teams.filter(t => t.leagueId === parseInt(selectedLeague));
        }

        return { teams, leagues: leagues_items };
    }, [activeTab, favoriteTeams, favoriteLeagues, searchTerm, selectedLeague]);

    // إحصائيات
    const stats = useMemo(() => ({
        totalTeams: favoriteTeams.length,
        totalLeagues: favoriteLeagues.length,
        total: favoriteTeams.length + favoriteLeagues.length
    }), [favoriteTeams, favoriteLeagues]);

    return (
        <div className="favorites-container">
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-icon">
                            <FaExclamationTriangle />
                        </div>
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to remove 
                            <strong> {itemToDelete?.name || itemToDelete?.team?.name} </strong> 
                            from your favorites?
                        </p>
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={handleCancelDelete}>
                                Cancel
                            </button>
                            <button className="confirm-btn delete" onClick={handleConfirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="favorites-header">
                <div className="header-icon">
                    <FaHeart />
                </div>
                <h1>My Favorites</h1>
                <p className="header-subtitle">
                    {stats.total} items • {stats.totalTeams} teams • {stats.totalLeagues} leagues
                </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card teams">
                    <div className="stat-icon">⚽</div>
                    <div className="stat-info">
                        <span className="stat-label">Teams</span>
                        <span className="stat-value">{stats.totalTeams}</span>
                    </div>
                </div>
                <div className="stat-card leagues">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                        <span className="stat-label">Leagues</span>
                        <span className="stat-value">{stats.totalLeagues}</span>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">❤️</div>
                    <div className="stat-info">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="favorites-content">
                {/* Sidebar - Available Teams */}
                <div className="favorites-sidebar">
                    <div className="sidebar-header">
                        <h3>
                            <FaPlus /> Add Teams
                        </h3>
                        <button 
                            className="refresh-btn"
                            onClick={() => window.location.reload()}
                            title="Refresh teams"
                        >
                            <FaRedoAlt />
                        </button>
                    </div>

                    {/* Search in available teams */}
                    <div className="sidebar-search">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                        />
                    </div>

                    {/* League filter */}
                    <select 
                        className="sidebar-filter"
                        value={selectedLeagueFilter}
                        onChange={(e) => setSelectedLeagueFilter(e.target.value)}
                    >
                        <option value="all">All Leagues</option>
                        {leagues.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.flag} {l.name}
                            </option>
                        ))}
                    </select>

                    {/* Available teams list */}
                    <div className="teams-list">
                        {loading ? (
                            <div className="list-loading">
                                <div className="spinner" />
                                <p>Loading teams...</p>
                            </div>
                        ) : filteredAvailableTeams.length === 0 ? (
                            <div className="list-empty">
                                <p>No teams available</p>
                                {teamSearch && (
                                    <button onClick={() => setTeamSearch('')}>
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="list-header">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedTeams.length === filteredAvailableTeams.length && filteredAvailableTeams.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                        <span>Select All ({filteredAvailableTeams.length})</span>
                                    </label>
                                    {selectedTeams.length > 0 && (
                                        <button 
                                            className="add-selected-btn"
                                            onClick={handleAddSelectedTeams}
                                        >
                                            Add Selected ({selectedTeams.length})
                                        </button>
                                    )}
                                </div>

                                {filteredAvailableTeams.map(team => (
                                    <div key={team.id} className="team-list-item">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeams.includes(team.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTeams([...selectedTeams, team.id]);
                                                    } else {
                                                        setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                                                    }
                                                }}
                                            />
                                            {team.logo ? (
                                                <img src={team.logo} alt={team.name} className="team-icon" />
                                            ) : (
                                                <span className="team-icon-placeholder">⚽</span>
                                            )}
                                            <div className="team-info">
                                                <span className="team-name">{team.name}</span>
                                                <span className="team-league">
                                                    {team.leagueFlag} {team.league}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Area - Favorites */}
                <div className="favorites-main">
                    {/* Filters */}
                    <div className="filters-bar">
                        <div className="tabs">
                            <button 
                                className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All ({stats.total})
                            </button>
                            <button 
                                className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
                                onClick={() => setActiveTab('teams')}
                            >
                                ⚽ Teams ({stats.totalTeams})
                            </button>
                            <button 
                                className={`tab ${activeTab === 'leagues' ? 'active' : ''}`}
                                onClick={() => setActiveTab('leagues')}
                            >
                                🏆 Leagues ({stats.totalLeagues})
                            </button>
                        </div>

                        <div className="filter-controls">
                            <div className="search-box">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search favorites..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            {activeTab !== 'leagues' && (
                                <select 
                                    className="league-filter"
                                    value={selectedLeague}
                                    onChange={(e) => setSelectedLeague(e.target.value)}
                                >
                                    <option value="all">All Leagues</option>
                                    {leagues.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {l.flag} {l.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="view-toggle">
                                <button 
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <FaThLarge />
                                </button>
                                <button 
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <FaThList />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Favorites Display */}
                    {stats.total === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">❤️</div>
                            <h2>No favorites yet</h2>
                            <p>Select teams from the left panel to add them to your favorites</p>
                        </div>
                    ) : (
                        <div className={`favorites-display ${viewMode}`}>
                            {/* Teams */}
                            {filteredFavorites.teams.map(team => (
                                <div key={team.id} className={`favorite-item ${viewMode}`}>
                                    <button
                                        className="remove-btn"
                                        onClick={() => confirmDelete(team, 'team')}
                                        title="Remove from favorites"
                                    >
                                        <FaTimes />
                                    </button>
                                    
                                    {team.logo ? (
                                        <img src={team.logo} alt={team.name} className="item-logo" />
                                    ) : (
                                        <div className="item-logo-placeholder">
                                            {team.name?.charAt(0)}
                                        </div>
                                    )}
                                    
                                    <div className="item-info">
                                        <h4>{team.name}</h4>
                                        <span className="item-meta">
                                            {team.leagueFlag} {team.leagueName || 'Unknown League'}
                                        </span>
                                        {team.country && (
                                            <span className="item-country">{team.country}</span>
                                        )}
                                    </div>
                                    
                                    <div className="item-actions">
                                        <Link to={`/club/${team.id}`} className="view-link">
                                            View <FaArrowRight />
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {/* Leagues */}
                            {filteredFavorites.leagues.map(league => {
                                const leagueInfo = leagues.find(l => l.id === league.id) || league;
                                return (
                                    <div key={league.id} className={`favorite-item league ${viewMode}`}>
                                        <button
                                            className="remove-btn"
                                            onClick={() => confirmDelete(league, 'league')}
                                            title="Remove from favorites"
                                        >
                                            <FaTimes />
                                        </button>
                                        
                                        <div className="item-flag">{leagueInfo.flag}</div>
                                        
                                        <div className="item-info">
                                            <h4>{leagueInfo.name}</h4>
                                            <span className="item-meta">{leagueInfo.country}</span>
                                        </div>
                                        
                                        <div className="item-actions">
                                            <Link to={`/${league.id === 39 ? 'premier-league' : 
                                                       league.id === 140 ? 'la-liga' :
                                                       league.id === 135 ? 'serie-a' :
                                                       league.id === 78 ? 'bundesliga' : 'ligue-1'}`} 
                                                  className="view-link">
                                                View <FaArrowRight />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Favorites;