import React from 'react';
import LeaguePage from '../LeaguePage';

const CONFIG = {
    leagueId: 61,
    name:     'Ligue 1',
    flag:     '🇫🇷',
    color:    '#003189',
    gradient: 'linear-gradient(135deg, #003189 0%, #1d4ed8 100%)',
    season:   '2024/25',
    subtitle: 'Le Championnat',
};

const Ligue1 = () => <LeaguePage config={CONFIG} />;
export default Ligue1;