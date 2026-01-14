import React, { useEffect, useState } from 'react';
import { useParams, Link, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Activity } from 'lucide-react';
import ClientAssistant from './ClientAssistant';
import { subscribeToCampaigns, addCampaign } from '../../firebase';
import Modal from '../../components/ui/Modal';
import NewCampaignModal from '../../features/campaigns/NewCampaignModal';
import { Plus } from 'lucide-react';

const ClientCampaignsView = ({ clientId }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsub = subscribeToCampaigns(clientId, setCampaigns);
        return () => unsub && unsub();
    }, [clientId]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Campaigns</h3>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Campaign
                </button>
            </div>

            {campaigns.length === 0 && <p className="text-secondary" style={{ marginTop: '1rem' }}>No campaigns found for this client.</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>{campaign.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Active</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Budget: <span style={{ color: 'white' }}>{campaign.budget}</span>
                        </div>
                        <Link to={`/campaigns/${campaign.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem' }}>
                            Open Assistant
                        </Link>
                    </div>
                ))}
            </div>

            <NewCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clientId={clientId}
            />
        </div>
    );
};

const ClientDetail = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <button onClick={() => navigate('/clients')} className="btn-text" style={{ padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ margin: 0 }}>Client Dashboard</h2>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ID: {clientId}</span>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <Routes>
                    <Route path="/" element={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Select an action from the list.</div>} />
                    <Route path="chat" element={<ClientAssistant />} />
                    <Route path="campaigns" element={<ClientCampaignsView clientId={clientId} />} />
                </Routes>
            </div>
        </div>
    );
};

export default ClientDetail;
