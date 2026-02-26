import React from 'react';
import LeaguePage from '../LeaguePage';

const CONFIG = {
    leagueId: 140,
    name:     'La Liga',
    flag:     '🇪🇸',
    color:    '#ee8707',
    gradient: 'linear-gradient(135deg, #ee8707 0%, #f5a623 100%)',
    season:   '2024/25',
    subtitle: 'El Fútbol de España',
};

const LaLiga = () => <LeaguePage config={CONFIG} />;
export default LaLiga;