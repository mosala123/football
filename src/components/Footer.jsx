import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaFootballBall,
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaYoutube,
    FaLinkedin,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaArrowUp,
    FaHeart,
    FaTrophy,
    FaFutbol,
    FaGithub
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    // متابعة التمرير لإظهار/إخفاء زر العودة للأعلى
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const quickLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/live-scores', label: 'Live Scores', icon: '⚡' },
        { path: '/top-scorers', label: 'Top Scorers', icon: '⚽' },
        { path: '/team-comparison', label: 'Comparison', icon: '⚖️' },
        { path: '/favorites', label: 'Favorites', icon: '❤️' }
    ];

    const leagues = [
        { path: '/premier-league', name: 'Premier League', flag: '🇬🇧' },
        { path: '/la-liga', name: 'La Liga', flag: '🇪🇸' },
        { path: '/serie-a', name: 'Serie A', flag: '🇮🇹' },
        { path: '/bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
        { path: '/ligue-1', name: 'Ligue 1', flag: '🇫🇷' }
    ];

    const socialLinks = [
        { icon: <FaFacebook />, url: 'https://facebook.com', name: 'Facebook', color: '#1877f2' },
        { icon: <FaTwitter />, url: 'https://twitter.com', name: 'Twitter', color: '#1da1f2' },
        { icon: <FaInstagram />, url: 'https://instagram.com', name: 'Instagram', color: '#e4405f' },
        { icon: <FaYoutube />, url: 'https://youtube.com', name: 'YouTube', color: '#ff0000' },
        { icon: <FaLinkedin />, url: 'https://linkedin.com', name: 'LinkedIn', color: '#0077b5' },
        { icon: <FaGithub />, url: 'https://github.com', name: 'GitHub', color: '#333' }
    ];

    return (
        <footer className="footer">
            {/* الموجة الزخرفية في الأعلى */}
            <div className="footer-wave">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="rgba(64, 224, 208, 0.1)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                </svg>
            </div>

            <div className="footer-content">
                <div className="footer-container">
                    {/* القسم الأول: معلومات عن الموقع */}
                    <div className="footer-section about-section">
                        <div className="footer-logo">
                            <FaFootballBall className="footer-icon" />
                            <span className="logo-text">MyFootball</span>
                        </div>
                        <p className="about-text">
                            Your ultimate destination for European football. Track live scores, 
                            standings, top scorers, and team information across the top 5 leagues.
                            Real-time updates, comprehensive statistics, and an amazing community 
                            of football fans.
                        </p>
                        
                        <div className="achievement-badges">
                            <span className="badge">
                                <FaTrophy /> 5 Leagues
                            </span>
                            <span className="badge">
                                <FaFutbol /> Live Scores
                            </span>
                            <span className="badge">
                                <FaHeart /> 1000+ Fans
                            </span>
                        </div>

                        <div className="contact-info">
                            <div className="contact-item">
                                <FaEnvelope className="contact-icon" />
                                <span>info@myfootball.com</span>
                            </div>
                            <div className="contact-item">
                                <FaPhone className="contact-icon" />
                                <span>+1 234 567 890</span>
                            </div>
                            <div className="contact-item">
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>Football City, UK</span>
                            </div>
                        </div>
                    </div>

                    {/* القسم الثاني: روابط سريعة */}
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul className="footer-links">
                            {quickLinks.map(link => (
                                <li key={link.path}>
                                    <Link to={link.path}>
                                        <span className="link-icon">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* القسم الثالث: الدوريات */}
                    <div className="footer-section leagues-section">
                        <h3>Top Leagues</h3>
                        <ul className="footer-links">
                            {leagues.map(league => (
                                <li key={league.path}>
                                    <Link to={league.path}>
                                        <span className="link-icon">{league.flag}</span>
                                        {league.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* القسم الرابع: تواصل اجتماعي ونشرة بريدية */}
                    <div className="footer-section social-section">
                        <h3>Follow Us</h3>
                        <p className="social-desc">Stay connected for the latest updates, news, and exclusive content</p>
                        
                        <div className="social-links">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`social-link ${social.name.toLowerCase()}`}
                                    style={{ '--social-color': social.color }}
                                    title={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        <div className="newsletter">
                            <h4>Newsletter</h4>
                            <p className="newsletter-desc">Subscribe to get daily football updates</p>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="subscribe-btn">
                                        Subscribe
                                    </button>
                                </div>
                                {subscribed && (
                                    <div className="success-message">
                                        ✅ Thanks for subscribing!
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* القسم السفلي */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <div className="copyright">
                        <p>© {currentYear} <span className="brand">MyFootball</span>. All rights reserved.</p>
                        <p className="made-with">
                            Made with <FaHeart className="heart-icon" /> for football fans worldwide
                        </p>
                    </div>
                    
                    <div className="footer-meta">
                        <Link to="/privacy">Privacy Policy</Link>
                        <span className="separator">•</span>
                        <Link to="/terms">Terms of Service</Link>
                        <span className="separator">•</span>
                        <Link to="/contact">Contact</Link>
                        <span className="separator">•</span>
                        <Link to="/sitemap">Sitemap</Link>
                    </div>
                    
                    <div className="footer-info">
                        <p>Version 2.0.0 | Last updated: March 2024</p>
                    </div>
                </div>
            </div>

            {/* زر العودة للأعلى */}
            <button
                className={`back-to-top ${showBackToTop ? 'show' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <FaArrowUp />
            </button>
        </footer>
    );
};

export default Footer;