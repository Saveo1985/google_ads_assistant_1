import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import { addCampaign, updateCampaign, subscribeToAllCampaigns, saveKnowledge } from '../../firebase';
import { parseCSV, formatCSVDataForAI } from '../../utils/csvParser';
import { Upload, Link as LinkIcon, Plus } from 'lucide-react';

const NewCampaignModal = ({ isOpen, onClose, clientId }) => {
    const [activeTab, setActiveTab] = useState('fresh'); // 'fresh' | 'import'
    const [loading, setLoading] = useState(false);

    // Joint State (used by both tabs mostly)
    const [campaignData, setCampaignData] = useState({
        name: '',
        status: 'Enabled',
        type: 'Search', // Search, Display, Video, PMax, Shopping
        objective: 'Sales', // Sales, Leads, Traffic, Awareness
        biddingStrategy: 'Max Conversions',
        biddingStrategy: 'Max Conversions',
        locations: '',
        budget: ''
    });
    const [csvFile, setCsvFile] = useState(null);

    // Reset on tab switch or open
    useEffect(() => {
        if (!isOpen) {
            setCampaignData({ name: '', status: 'Enabled', type: 'Search', objective: 'Sales', biddingStrategy: 'Max Conversions', locations: '', adSchedule: '', budget: '' });
            setCsvFile(null);
            setActiveTab('fresh');
        }
    }, [isOpen]);

    const validateForm = () => {
        if (!campaignData.name.trim()) {
            alert("Please enter a campaign name.");
            return false;
        }
        if (!campaignData.budget.trim()) {
            alert("Please enter a budget.");
            return false;
        }
        return true;
    };

    const handleCreateFresh = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Create Campaign Document (No CSV)
            const campaignDoc = await addCampaign(clientId, campaignData);

            // Save initial settings context
            const contextSummary = `Campaign Settings (Fresh):\nType: ${campaignData.type}\nObjective: ${campaignData.objective}\nBidding: ${campaignData.biddingStrategy}\nLocations: ${campaignData.locations}`;
            await saveKnowledge(campaignDoc.id, contextSummary, 'campaign_settings');

            onClose();
        } catch (error) {
            console.error("Error creating fresh campaign:", error);
            alert("Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    const handleImportExisting = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!csvFile) {
            alert("Please upload the historical data CSV to import an existing campaign.");
            return;
        }
        setLoading(true);
        try {
            // Create Campaign Document (With CSV)
            // We flag it as 'Imported' status or just add a tag
            const dataToSave = { ...campaignData, imported: true };
            const campaignDoc = await addCampaign(clientId, dataToSave);

            // Process CSV (Critical for this flow)
            const parsedData = await parseCSV(csvFile);
            const summary = `Imported History for ${campaignData.name}:\n` + formatCSVDataForAI(parsedData);
            await saveKnowledge(campaignDoc.id, summary, 'csv_import');

            // Save settings context
            const contextSummary = `Campaign Settings (Imported):\nType: ${campaignData.type}\nObjective: ${campaignData.objective}\nBidding: ${campaignData.biddingStrategy}\nBudget: ${campaignData.budget}`;
            await saveKnowledge(campaignDoc.id, contextSummary, 'campaign_settings');

            onClose();
        } catch (error) {
            console.error("Error importing campaign:", error);
            alert("Failed to import campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Campaign Management">

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setActiveTab('fresh')}
                    className="btn-text"
                    style={{
                        padding: '0.5rem 1rem',
                        borderBottom: activeTab === 'fresh' ? '2px solid var(--accent-primary)' : 'none',
                        color: activeTab === 'fresh' ? 'white' : 'var(--text-secondary)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={16} /> Create Fresh
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className="btn-text"
                    style={{
                        padding: '0.5rem 1rem',
                        borderBottom: activeTab === 'import' ? '2px solid var(--accent-primary)' : 'none',
                        color: activeTab === 'import' ? 'white' : 'var(--text-secondary)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={16} /> Import from Google Ads
                    </div>
                </button>
            </div>

            {/* Shared Form Fields Helper */}
            {/* We duplicate form for clarity since logic differs slightly (e.g. valid fields) - or just reuse and hide/show CSV */}

            <form onSubmit={activeTab === 'fresh' ? handleCreateFresh : handleImportExisting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Campaign Name</label>
                        <input className="input-field" value={campaignData.name} onChange={e => setCampaignData({ ...campaignData, name: e.target.value })} placeholder="e.g. Q1 Sales" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Budget</label>
                        <input className="input-field" value={campaignData.budget} onChange={e => setCampaignData({ ...campaignData, budget: e.target.value })} placeholder="$1000/mo" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Type</label>
                        <select className="input-field" value={campaignData.type} onChange={e => setCampaignData({ ...campaignData, type: e.target.value })}>
                            <option>Search</option>
                            <option>Display</option>
                            <option>Video</option>
                            <option>Performance Max</option>
                            <option>Shopping</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Objective</label>
                        <select className="input-field" value={campaignData.objective} onChange={e => setCampaignData({ ...campaignData, objective: e.target.value })}>
                            <option>Sales</option>
                            <option>Leads</option>
                            <option>Website Traffic</option>
                            <option>Brand Awareness</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Bidding Strategy</label>
                    <select className="input-field" value={campaignData.biddingStrategy} onChange={e => setCampaignData({ ...campaignData, biddingStrategy: e.target.value })}>
                        <option>Maximize Conversions</option>
                        <option>Maximize Clicks</option>
                        <option>Target ROAS</option>
                        <option>Target CPA</option>
                        <option>Manual CPC</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Target Locations</label>
                    <input className="input-field" value={campaignData.locations} onChange={e => setCampaignData({ ...campaignData, locations: e.target.value })} placeholder="e.g. USA, Canada" />
                </div>

                {/* CSV Upload - ONLY for Import Tab */}
                {activeTab === 'import' && (
                    <div style={{ border: '1px dashed var(--accent-primary)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', background: 'rgba(59, 130, 246, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Upload size={16} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Import Historical Data (.csv)</label>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                            Upload the export file from Google Ads to give the AI context.
                        </p>
                        <input type="file" accept=".csv" required={false /* explicit false */} onChange={e => setCsvFile(e.target.files[0])} className="input-field" style={{ padding: '0.5rem' }} />
                        {csvFile && <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>Selected: {csvFile.name}</div>}
                    </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    {loading ? 'Processing...' : (activeTab === 'fresh' ? 'Create Fresh Campaign' : 'Import & Analyze')}
                </button>
            </form>
        </Modal>
    );
};

export default NewCampaignModal;
