import React from 'react';
import LeaguePage from '../LeaguePage';

const CONFIG = {
    leagueId: 78,
    name:     'Bundesliga',
    flag:     '🇩🇪',
    color:    '#d20515',
    gradient: 'linear-gradient(135deg, #d20515 0%, #dc2626 100%)',
    season:   '2024/25',
    subtitle: 'Die Beste Liga der Welt',
};

const Bundesliga = () => <LeaguePage config={CONFIG} />;
export default Bundesliga;