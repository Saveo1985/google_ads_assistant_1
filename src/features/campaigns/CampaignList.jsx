import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Activity, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { subscribeToAllCampaigns, addCampaign, subscribeToClients } from '../../firebase';
import Modal from '../../components/ui/Modal';

const AccordionItem = ({ client, campaigns = [] }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ marginBottom: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{client.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({campaigns.length} campaigns)</span>
                </div>
            </button>

            {isOpen && (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                    {campaigns.length === 0 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No campaigns for this client.</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
                </div>
            )}
        </div>
    );
};

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
            if (unsubCampaigns && typeof unsubCampaigns === 'function') unsubCampaigns();
            if (unsubClients && typeof unsubClients === 'function') unsubClients();
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

    // Group campaigns by client
    const getClientCampaigns = (clientId) => campaigns.filter(c => c.clientId === clientId);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Campaigns</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> New Campaign
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {clients.map(client => (
                    <AccordionItem key={client.id} client={client} campaigns={getClientCampaigns(client.id)} />
                ))}

                {clients.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <p>No clients found. Create a client first.</p>
                    </div>
                )}
            </div>

            {campaigns.length === 0 && clients.length > 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Activity size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p>No campaigns yet. Expand a client or click New Campaign to create one.</p>
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
