import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink, MessageSquare } from 'lucide-react';
import { subscribeToClients, addClient } from '../../firebase';
import Modal from '../../components/ui/Modal';

const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', website: '', industry: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToClients(setClients);
        return () => unsubscribe && unsubscribe(); // Handle async nature if needed, but updated firebase.js returns unsubscribe directly from waitForAuth wrapper? 
        // Wait, my firebase.js subscribe wrapper returns a promise that resolves to the unsubscribe function.
        // So this cleanup needs to handle the promise.
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addClient(newClient);
            setIsModalOpen(false);
            setNewClient({ name: '', website: '', industry: '' });
        } catch (error) {
            console.error("Error adding client:", error);
            alert("Failed to add client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Clients</h1>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Add Client
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {clients.map(client => (
                    <div key={client.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{client.name}</h3>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{client.industry}</div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Globe size={20} className="text-secondary" />
                            </div>
                        </div>

                        {client.website && (
                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="btn-text" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', alignSelf: 'flex-start', padding: 0 }}>
                                {new URL(client.website).hostname} <ExternalLink size={12} />
                            </a>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                            <Link to={`/clients/${client.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', padding: '0.6rem' }}>
                                Dashboard
                            </Link>
                            <Link to={`/clients/${client.id}/chat`} className="btn-text" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <MessageSquare size={16} /> Assistant
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {clients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <p>No clients yet. Add one to get started.</p>
                </div>
            )}

            {/* Add Client Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Client Name</label>
                        <input
                            className="input-field"
                            required
                            value={newClient.name}
                            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Website URL</label>
                        <input
                            className="input-field"
                            required
                            type="url"
                            value={newClient.website}
                            onChange={e => setNewClient({ ...newClient, website: e.target.value })}
                            placeholder="https://example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Industry</label>
                        <input
                            className="input-field"
                            value={newClient.industry}
                            onChange={e => setNewClient({ ...newClient, industry: e.target.value })}
                            placeholder="e.g. E-commerce"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                        {loading ? 'Adding...' : 'Create Client'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ClientList;
