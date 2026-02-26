import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaFutbol, FaHome, FaFire, FaTrophy, FaHeart, 
    FaBars, FaTimes, FaChevronDown 
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navigation.css';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    // ✅ تعريف المتغير showLeaguesDropdown
    const [showLeaguesDropdown, setShowLeaguesDropdown] = useState(false);
    const location = useLocation();

    const leagues = [
        { path: '/premier-league', name: 'Premier League', flag: '🇬🇧', color: '#3d195b' },
        { path: '/la-liga', name: 'La Liga', flag: '🇪🇸', color: '#ee8707' },
        { path: '/serie-a', name: 'Serie A', flag: '🇮🇹', color: '#024494' },
        { path: '/bundesliga', name: 'Bundesliga', flag: '🇩🇪', color: '#d20515' },
        { path: '/ligue-1', name: 'Ligue 1', flag: '🇫🇷', color: '#dae025' }
    ];

    const navLinks = [
        { path: '/', label: 'Home', icon: <FaHome /> },
        { path: '/live-scores', label: 'Live Scores', icon: <FaFire /> },
        { path: '/top-scorers', label: 'Top Scorers', icon: <FaTrophy /> },
        // ❌ تم إزالة رابط Comparison
        { path: '/favorites', label: 'Favorites', icon: <FaHeart /> }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // إغلاق القوائم عند تغيير الصفحة
    useEffect(() => {
        setIsOpen(false);
        setShowLeaguesDropdown(false);
    }, [location]);

    // إغلاق القائمة عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container') && !event.target.closest('.navbar-toggler')) {
                setShowLeaguesDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleLeaguesDropdown = () => setShowLeaguesDropdown(!showLeaguesDropdown);

    const isActive = (path) => {
        if (path === '/') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const isLeagueActive = () => {
        return leagues.some(league => location.pathname.startsWith(league.path));
    };

    const activeLeague = leagues.find(league => location.pathname.startsWith(league.path));

    return (
        <nav className={`navbar navbar-expand-lg custom-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container-fluid px-4">
                {/* Logo */}
                <Link to="/" className="navbar-brand d-flex align-items-center" onClick={() => setIsOpen(false)}>
                    <FaFutbol className="brand-icon me-2" />
                    <span className="brand-text">MyFootball</span>
                </Link>

                {/* Toggler للموبايل */}
                <button 
                    className="navbar-toggler"
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Navbar Content */}
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav ms-auto">
                        {/* روابط التنقل الرئيسية */}
                        {navLinks.map((link) => (
                            <li className="nav-item" key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`nav-link d-flex align-items-center gap-2 ${isActive(link.path) ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}

                        {/* Leagues Dropdown - بالضغط فقط */}
                        <li className={`nav-item dropdown ${showLeaguesDropdown ? 'show' : ''}`}>
                            <div className="dropdown-container">
                                <Link
                                    to={activeLeague?.path || '/premier-league'}
                                    className={`nav-link d-flex align-items-center gap-2 ${isLeagueActive() ? 'active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="nav-icon">🏆</span>
                                    <span>{activeLeague ? activeLeague.name : 'Leagues'}</span>
                                </Link>
                                
                                <button
                                    className="dropdown-toggle-btn"
                                    onClick={toggleLeaguesDropdown}
                                    aria-label="Toggle leagues menu"
                                >
                                    <FaChevronDown className={`dropdown-arrow ${showLeaguesDropdown ? 'rotated' : ''}`} />
                                </button>
                            </div>

                            {/* القائمة المنسدلة */}
                            <ul className={`dropdown-menu ${showLeaguesDropdown ? 'show' : ''}`}>
                                {leagues.map((league) => (
                                    <li key={league.path}>
                                        <Link
                                            to={league.path}
                                            className={`dropdown-item d-flex align-items-center gap-2 ${location.pathname === league.path ? 'active' : ''}`}
                                            style={{ '--league-color': league.color }}
                                            onClick={() => {
                                                setShowLeaguesDropdown(false);
                                                setIsOpen(false);
                                            }}
                                        >
                                            <span className="league-flag">{league.flag}</span>
                                            <span className="league-name">{league.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;