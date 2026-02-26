import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaFutbol, FaHome, FaFire, FaTrophy,
    FaHeart, FaBalanceScale, FaBars, FaTimes, FaChevronDown
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navigation.css';

const Navigation = () => {
    const [isOpen, setIsOpen]                     = useState(false);
    const [scrolled, setScrolled]                 = useState(false);
    const [showLeaguesDropdown, setShowLeagues]   = useState(false);
    const dropdownRef                             = useRef(null);
    const location                                = useLocation();

    /* ── Data ── */
    const leagues = [
        { path: '/premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3d195b' },
        { path: '/la-liga',        name: 'La Liga',         flag: '🇪🇸',         color: '#ee8707' },
        { path: '/serie-a',        name: 'Serie A',         flag: '🇮🇹',         color: '#024494' },
        { path: '/bundesliga',     name: 'Bundesliga',      flag: '🇩🇪',         color: '#d20515' },
        { path: '/ligue-1',        name: 'Ligue 1',         flag: '🇫🇷',         color: '#003189' },
    ];

    const navLinks = [
        { path: '/',               label: 'Home',       icon: <FaHome />        },
        { path: '/live-scores',    label: 'Live',       icon: <FaFire />        },
        { path: '/top-scorers',    label: 'Scorers',    icon: <FaTrophy />      },
        { path: '/team-comparison',label: 'Compare',    icon: <FaBalanceScale />},
        { path: '/favorites',      label: 'Favorites',  icon: <FaHeart />       },
    ];

    /* ── Scroll listener ── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Close everything on route change ── */
    useEffect(() => {
        setIsOpen(false);
        setShowLeagues(false);
    }, [location]);

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowLeagues(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Helpers ── */
    const isActive      = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    const isLeagueActive = ()     => leagues.some(l => location.pathname.startsWith(l.path));
    const activeLeague  = leagues.find(l => location.pathname.startsWith(l.path));

    return (
        <nav className={`navbar navbar-expand-lg custom-navbar${scrolled ? ' navbar-scrolled' : ''}`}>
            <div className="container-fluid px-3 px-md-4">

                {/* ── Brand ── */}
                <Link
                    to="/"
                    className="navbar-brand d-flex align-items-center"
                    onClick={() => setIsOpen(false)}
                >
                    <FaFutbol className="brand-icon" />
                    <span className="brand-text ms-2">MyFootball</span>
                </Link>

                {/* ── Mobile toggler ── */}
                <button
                    className="navbar-toggler border-0 ms-auto"
                    onClick={() => setIsOpen(v => !v)}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* ── Collapsible content ── */}
                <div className={`collapse navbar-collapse${isOpen ? ' show' : ''}`}>
                    <ul className="navbar-nav ms-auto align-items-lg-center">

                        {/* Main links */}
                        {navLinks.map((link) => (
                            <li className="nav-item" key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`nav-link${isActive(link.path) ? ' active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="nav-icon">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}

                        {/* Leagues dropdown */}
                        <li
                            className={`nav-item dropdown${showLeaguesDropdown ? ' show' : ''}`}
                            ref={dropdownRef}
                        >
                            <div className="dropdown-container">
                                <Link
                                    to={activeLeague?.path || '/premier-league'}
                                    className={`nav-link${isLeagueActive() ? ' active' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span className="nav-icon" aria-hidden="true">🏆</span>
                                    <span>{activeLeague ? activeLeague.name : 'Leagues'}</span>
                                </Link>

                                <button
                                    className="dropdown-toggle-btn"
                                    onClick={() => setShowLeagues(v => !v)}
                                    aria-expanded={showLeaguesDropdown}
                                    aria-haspopup="listbox"
                                    aria-label="Toggle leagues menu"
                                >
                                    <FaChevronDown
                                        className={`dropdown-arrow${showLeaguesDropdown ? ' rotated' : ''}`}
                                    />
                                </button>
                            </div>

                            <ul
                                className={`dropdown-menu${showLeaguesDropdown ? ' show' : ''}`}
                                role="listbox"
                            >
                                {leagues.map((league) => (
                                    <li key={league.path}>
                                        <Link
                                            to={league.path}
                                            className={`dropdown-item${location.pathname.startsWith(league.path) ? ' active' : ''}`}
                                            style={{ '--league-color': league.color }}
                                            onClick={() => { setShowLeagues(false); setIsOpen(false); }}
                                            role="option"
                                            aria-selected={location.pathname.startsWith(league.path)}
                                        >
                                            <span className="league-flag" aria-hidden="true">{league.flag}</span>
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