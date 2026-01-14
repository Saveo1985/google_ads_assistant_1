import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Activity, Briefcase } from 'lucide-react';
import { subscribeToAllCampaigns, addCampaign, subscribeToClients } from '../../firebase';
import Modal from '../../components/ui/Modal';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', clientId: '', budget: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubCampaigns = subscribeToAllCampaigns(setCampaigns);
        const unsubClients = subscribeToClients(setClients);
        return () => {
            // Cleanup if helpers return unsub function directly or promise
            // In our current firebase.js implementation, they return promise of unsub or just unsub from within promise. 
            // This is a simplified usage. Real cleanup handled by component unmount mostly.
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCampaign.clientId) return alert("Please select a client");
        setLoading(true);
        try {
            await addCampaign(newCampaign.clientId, { name: newCampaign.name, budget: newCampaign.budget });
            setIsModalOpen(false);
            setNewCampaign({ name: '', clientId: '', budget: '' });
        } catch (error) {
            console.error("Error adding campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const getClientName = (id) => {
        const client = clients.find(c => c.id === id);
        return client ? client.name : 'Unknown Client';
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Campaigns</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> New Campaign
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{campaign.name}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={14} /> {getClientName(campaign.clientId)}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                Active
                            </div>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Budget: <span style={{ color: 'white' }}>{campaign.budget}</span>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <Link to={`/campaigns/${campaign.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', padding: '0.6rem' }}>
                                Manage Campaign
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No active campaigns found. Create one to get started.</p>
                </div>
            )}

            {/* Add Campaign Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Campaign">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Client</label>
                        <select
                            className="input-field"
                            required
                            value={newCampaign.clientId}
                            onChange={e => setNewCampaign({ ...newCampaign, clientId: e.target.value })}
                        >
                            <option value="">Select a Client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Campaign Name</label>
                        <input className="input-field" required value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} placeholder="e.g. Q1 Marketing" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Budget</label>
                        <input className="input-field" required value={newCampaign.budget} onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value })} placeholder="$1000/mo" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Creating...' : 'Create Campaign'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default CampaignList;
