import React from 'react';
import LeaguePage from '../LeaguePage';

const CONFIG = {
    leagueId: 135,
    name:     'Serie A',
    flag:     '🇮🇹',
    color:    '#024494',
    gradient: 'linear-gradient(135deg, #024494 0%, #0369a1 100%)',
    season:   '2024/25',
    subtitle: 'Il Calcio Italiano',
};

const SerieA = () => <LeaguePage config={CONFIG} />;
export default SerieA;