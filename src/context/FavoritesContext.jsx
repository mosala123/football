import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favoriteTeams, setFavoriteTeams] = useState([]);
    const [favoriteLeagues, setFavoriteLeagues] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedTeams = localStorage.getItem('favoriteTeams');
            const savedLeagues = localStorage.getItem('favoriteLeagues');
            if (savedTeams) setFavoriteTeams(JSON.parse(savedTeams));
            if (savedLeagues) setFavoriteLeagues(JSON.parse(savedLeagues));
        } catch (error) {
            console.error('Error loading favorites from localStorage:', error);
        }
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('favoriteTeams', JSON.stringify(favoriteTeams));
    }, [favoriteTeams]);

    useEffect(() => {
        localStorage.setItem('favoriteLeagues', JSON.stringify(favoriteLeagues));
    }, [favoriteLeagues]);

    const toggleFavoriteTeam = (teamId, teamData = {}) => {
        setFavoriteTeams((prev) => {
            const isFavorited = prev.some((t) => t.id === teamId);
            if (isFavorited) {
                return prev.filter((t) => t.id !== teamId);
            } else {
                return [...prev, { id: teamId, ...teamData }];
            }
        });
    };

    const toggleFavoriteLeague = (leagueId, leagueData = {}) => {
        setFavoriteLeagues((prev) => {
            const isFavorited = prev.some((l) => l.id === leagueId);
            if (isFavorited) {
                return prev.filter((l) => l.id !== leagueId);
            } else {
                return [...prev, { id: leagueId, ...leagueData }];
            }
        });
    };

    const isFavoriteTeam = (teamId) => {
        return favoriteTeams.some((t) => t.id === teamId);
    };

    const isFavoriteLeague = (leagueId) => {
        return favoriteLeagues.some((l) => l.id === leagueId);
    };

    const value = {
        favoriteTeams,
        favoriteLeagues,
        toggleFavoriteTeam,
        toggleFavoriteLeague,
        isFavoriteTeam,
        isFavoriteLeague,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};
