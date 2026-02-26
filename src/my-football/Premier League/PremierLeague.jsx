import React from 'react';
import LeaguePage from '../LeaguePage';

const CONFIG = {
    leagueId: 39,
    name: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', // العلم المصحح
    color: '#3d195b',
    gradient: 'linear-gradient(135deg, #3d195b 0%, #5d2a8c 100%)',
    season: '2024/25',
    subtitle: 'The Beautiful Game',
};

const PremierLeague = () => <LeaguePage config={CONFIG} />;
export default PremierLeague;