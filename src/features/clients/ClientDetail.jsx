import React, { useEffect, useState } from 'react';
import { useParams, Link, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Activity } from 'lucide-react';
import ClientAssistant from './ClientAssistant';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Direct access for single doc fetch if not in helper

// We need a helper for getting a single client
const getClient = async (id) => {
    // Ideally this should be in firebase.js but for speed adding here or assuming we can use db
    // We need to know APP_ID to construct path: apps/{APP_ID}/clients/{id}
    // Let's import getAppId from firebase.js
    // Wait, I didn't export getAppId. 
    // I'll fetch it from the 'clients' list or just pass it in props.
    // Actually, I should update firebase.js to export a getClient helper or just use the pattern.
    // For now, I'll rely on the List to pass data or just fetch it. Fetching is better for deep links.
    return null; // Placeholder
};

const ClientDetail = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    // In a real app we'd fetch client details here.
    // For now, simple layout wrapper for nested routes.

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
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/clients/${clientId}/chat`} className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <MessageSquare size={16} /> Open Assistant
                    </Link>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <Routes>
                    <Route path="/" element={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Select an action or open the Assistant.</div>} />
                    <Route path="chat" element={<ClientAssistant />} />
                </Routes>
            </div>
        </div>
    );
};

export default ClientDetail;
