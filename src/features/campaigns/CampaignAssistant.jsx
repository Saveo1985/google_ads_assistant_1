import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToMessages, sendMessage, saveKnowledge } from '../../firebase';
import ChatInterface from '../../components/ChatInterface';
import { formatCSVDataForAI, parseCSV } from '../../utils/csvParser';
import { Upload, FileText } from 'lucide-react';

const CampaignAssistant = () => {
    const { campaignId } = useParams(); // Note: Route needs to provide this
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const fileInputRef = useRef(null);

    const conversationId = `campaign_${campaignId}_main`;

    useEffect(() => {
        // If no campaignId (e.g. at /campaigns root), don't subscribe.
        if (campaignId) {
            const unsubscribe = subscribeToMessages(conversationId, setMessages);
            return () => unsubscribe && unsubscribe();
        }
    }, [campaignId, conversationId]);

    const handleSendMessage = async (text) => {
        setLoading(true);
        await sendMessage(conversationId, 'user', text);

        // Simulate AI
        setTimeout(async () => {
            let response = "I'm analyzing the campaign performance based on your inputs.";
            if (text.toLowerCase().includes('report') || text.toLowerCase().includes('csv')) {
                response = "Please upload the CSV report so I can analyze it.";
            }
            await sendMessage(conversationId, 'ai', response);
            setLoading(false);
        }, 1500);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const parsedData = await parseCSV(file);
            const formattedData = formatCSVDataForAI(parsedData);

            // Send as a system-like user message or hidden context
            // User sees: "Uploaded [filename]"
            await sendMessage(conversationId, 'user', `Uploaded report: ${file.name}`);

            // AI Processes it
            await sendMessage(conversationId, 'ai', `I have processed the file "${file.name}". Here is a summary of what I see:\n\n${formattedData.substring(0, 200)}... (truncated)\n\nYou can now ask specific questions about this data.`);

        } catch (error) {
            console.error("CSV Error:", error);
            await sendMessage(conversationId, 'ai', "Error processing the CSV file. Please ensure it is a valid format.");
        } finally {
            setLoading(false);
        }
    };

    const handleCleanChat = async () => {
        setCleaning(true);
        setTimeout(async () => {
            await saveKnowledge(campaignId, "Summarized campaign performance metrics from uploaded reports.", "campaign_summary");
            await sendMessage(conversationId, 'ai', "I've cleaned the chat history and saved the key campaign insights to memory.", { system: true });
            setCleaning(false);
        }, 2000);
    };

    if (!campaignId) return <div>Select a campaign to chat.</div>;

    return (
        <div style={{ height: 'calc(100vh - 80px)', position: 'relative' }}>
            {/* CSV Upload Overlay Button */}
            <div style={{ position: 'absolute', top: '10px', right: '150px', zIndex: 10 }}>
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="btn-text"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                >
                    <Upload size={16} /> Upload CSV
                </button>
            </div>

            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onCleanChat={handleCleanChat}
                loading={loading}
                isCleaning={cleaning}
                placeholder="Ask about campaign performance..."
            />
        </div>
    );
};

export default CampaignAssistant;
