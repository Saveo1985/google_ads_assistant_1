import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Activity } from 'lucide-react';
import { waitForAuth } from './firebase';
import ClientList from './features/clients/ClientList';
import ClientDetail from './features/clients/ClientDetail';
import CampaignList from './features/campaigns/CampaignList';
import CampaignAssistant from './features/campaigns/CampaignAssistant';

// Placeholder Components
const Dashboard = () => <div className="fade-in"><h1>Dashboard</h1><p className="text-secondary">Welcome to your Google Ads Assistant.</p></div>;

function App() {
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        waitForAuth().then(() => setAuthReady(true));
    }, []);

    if (!authReady) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <div className="loader" style={{ width: '24px', height: '24px', border: '2px solid #3b82f6', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ color: 'var(--text-secondary)' }}>Connecting to Secure Space...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <Router>
            <div className="app-container">
                <aside className="sidebar">
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <Activity className="text-accent" style={{ color: 'var(--accent-primary)' }} />
                        Ads<span style={{ color: 'var(--accent-primary)' }}>Assistant</span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <NavLink to="/" className={({ isActive }) => `btn-text ${isActive ? 'active-nav' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                        <NavLink to="/clients" className={({ isActive }) => `btn-text ${isActive ? 'active-nav' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <Users size={20} /> Clients
                        </NavLink>
                        <NavLink to="/campaigns" className={({ isActive }) => `btn-text ${isActive ? 'active-nav' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <Activity size={20} /> Campaigns
                        </NavLink>
                    </nav>

                    <div style={{ marginTop: 'auto' }}>
                        <div className="glass-panel" style={{ padding: '1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>Status</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
                                Online
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="main-content">
                    <header className="header">
                        <div style={{ fontWeight: 500 }}>Workspace</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1f1f22, #2d2d30)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                                <Users size={16} />
                            </div>
                        </div>
                    </header>

                    <div className="page-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/clients" element={<ClientList />} />
                            <Route path="/clients/:clientId/*" element={<ClientDetail />} />
                            <Route path="/campaigns" element={<CampaignList />} />
                            <Route path="/campaigns/:campaignId" element={<CampaignAssistant />} />
                        </Routes>
                    </div>
                </main>
            </div>
            <style>{`
        .active-nav {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary) !important;
        }
      `}</style>
        </Router>
    );
}

export default App;
