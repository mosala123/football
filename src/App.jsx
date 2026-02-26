import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import './App.css';

// Lazy Loading للصفحات لتحسين الأداء
const Home = lazy(() => import('./pages/Home'));
const LiveScores = lazy(() => import('./pages/LiveScores'));
const TopScorers = lazy(() => import('./pages/TopScorers'));
const MatchDetails = lazy(() => import('./pages/MatchDetails'));
const TeamComparison = lazy(() => import('./pages/TeamComparison'));
const Favorites = lazy(() => import('./pages/Favorites'));
const PremierLeague = lazy(() => import('./my-football/Premier League/PremierLeague'));
const LaLiga = lazy(() => import('./my-football/La Liga/LaLiga'));
const SerieA = lazy(() => import('./my-football/Serie A/SerieA'));
const Bundesliga = lazy(() => import('./my-football/Bundesliga/Bundesliga'));
const Ligue1 = lazy(() => import('./my-football/Ligue 1/Ligue1'));
const ClubDetails = lazy(() => import('./my-football/clubdetails/ClubDetails'));

// مكون التحميل المؤقت
const LoadingSpinner = () => (
    <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
    </div>
);

// مكون معالجة الأخطاء
const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = () => setHasError(true);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="error-boundary">
                <div className="error-content">
                    <h1>😵 Oops!</h1>
                    <p>Something went wrong. Please refresh the page or try again later.</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

function App() {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!online) {
        return (
            <div className="offline-message">
                <div className="offline-content">
                    <span className="offline-icon">📡</span>
                    <h2>No Internet Connection</h2>
                    <p>Please check your network connection and try again.</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <FavoritesProvider>
                <Router>
                    <div className="app-wrapper">
                        <Navigation />
                        <main className="main-content">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    {/* الصفحات الرئيسية */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/live-scores" element={<LiveScores />} />
                                    <Route path="/top-scorers" element={<TopScorers />} />
                                    <Route path="/match/:matchId" element={<MatchDetails />} />
                                    <Route path="/team-comparison" element={<TeamComparison />} />
                                    <Route path="/favorites" element={<Favorites />} />
                                    
                                    {/* صفحات الدوريات */}
                                    <Route path="/premier-league" element={<PremierLeague />} />
                                    <Route path="/la-liga" element={<LaLiga />} />
                                    <Route path="/serie-a" element={<SerieA />} />
                                    <Route path="/bundesliga" element={<Bundesliga />} />
                                    <Route path="/ligue-1" element={<Ligue1 />} />
                                    
                                    {/* صفحة تفاصيل النادي */}
                                    <Route path="/club/:clubId" element={<ClubDetails />} />
                                    
                                    {/* 404 - صفحة غير موجودة */}
                                    <Route path="*" element={
                                        <div className="not-found">
                                            <div className="not-found-content">
                                                <span className="not-found-icon">⚽</span>
                                                <h1>404</h1>
                                                <h2>Page Not Found</h2>
                                                <p>The page you're looking for doesn't exist or has been moved.</p>
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => window.history.back()}
                                                >
                                                    Go Back
                                                </button>
                                            </div>
                                        </div>
                                    } />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </FavoritesProvider>
        </ErrorBoundary>
    );
}

export default App;