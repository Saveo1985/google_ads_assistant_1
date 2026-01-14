import React, { useState } from 'react';
import ChatInterface from '../../components/ChatInterface';
import { addClient, addCampaign } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const AddClientAssistant = ({ onClose, onClientAdded }) => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'ai', content: "Hi! I'm here to help you onboard a new client. Please provide the client's **name** and **website URL**." }
    ]);
    const [loading, setLoading] = useState(false);
    const [clientData, setClientData] = useState({ name: '', website: '', industry: '' });
    const [step, setStep] = useState('initial'); // initial, scanning, industry_confirm, confirm_save, campaign_prompt
    const [savedClientId, setSavedClientId] = useState(null);
    const navigate = useNavigate();

    const handleSendMessage = async (text) => {
        const newMsg = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, newMsg]);
        setLoading(true);

        setTimeout(async () => {
            let aiResponse = "";
            let nextStep = step;

            if (step === 'initial') {
                const words = text.split(' ');
                const potentialUrl = words.find(w => w.includes('.') && !w.endsWith('.'));
                const name = text.replace(potentialUrl || '', '').trim();

                if (potentialUrl) {
                    let website = potentialUrl.startsWith('http') ? potentialUrl : `https://${potentialUrl}`;
                    setClientData(prev => ({ ...prev, name: name || "New Client", website })); // Fallback name

                    // Trigger "Scan"
                    aiResponse = `Thanks. I see the website is ${website}. I'm scanning it now to extract key information...`;
                    nextStep = 'scanning';

                    // Self-trigger next step after delay
                    setTimeout(() => handleScan(website, name || "New Client"), 1500);
                } else {
                    aiResponse = "I couldn't detect a website URL. Please provide the name and website (e.g., 'Acme Corp acme.com').";
                }
            } else if (step === 'industry_confirm') {
                // User confirming or correcting industry
                setClientData(prev => ({ ...prev, industry: text }));
                aiResponse = `Got it. Industry set to: ${text}.\n\nReady to save this client? (Yes/No)`;
                nextStep = 'confirm_save';
            } else if (step === 'confirm_save') {
                if (text.toLowerCase().includes('yes')) {
                    try {
                        const docRef = await addClient(clientData);
                        setSavedClientId(docRef.id);
                        onClientAdded(); // Refresh list background
                        aiResponse = "Client saved successfully! \n\n**Would you like to initialize a campaign for them right now?** (Yes/No)";
                        nextStep = 'campaign_prompt';
                    } catch (e) {
                        aiResponse = "Error saving client. Please try again.";
                    }
                } else {
                    aiResponse = "Okay, let's adjust. What field needs changing? (Name, Website, Industry)";
                    nextStep = 'initial'; // Simplified backtrack
                }
            } else if (step === 'campaign_prompt') {
                if (text.toLowerCase().includes('yes')) {
                    // Create default campaign
                    try {
                        const campaignRef = await addCampaign(savedClientId, {
                            name: `Launch Campaign - ${clientData.name}`,
                            budget: 'TBD'
                        });
                        aiResponse = "Great! I've created an initial campaign. Taking you there now...";
                        setTimeout(() => {
                            navigate(`/campaigns/${campaignRef.id}`); // Navigate to specific campaign assistant
                            onClose();
                        }, 2000);
                    } catch (e) {
                        aiResponse = "Failed to create campaign, but client is saved.";
                    }
                } else {
                    aiResponse = "Understood. You can create a campaign later. Closing assistant.";
                    setTimeout(onClose, 2000);
                }
            }

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponse }]);
            setLoading(false);
            setStep(nextStep);
        }, 1000);
    };

    const handleScan = (website, name) => {
        // Simulate scanning logic
        const urlLower = website.toLowerCase();
        let detectedIndustry = "General Business";
        let keywords = [];

        if (urlLower.includes('tech') || urlLower.includes('soft')) {
            detectedIndustry = "Technology / SaaS";
            keywords = ["software", "cloud", "AI"];
        } else if (urlLower.includes('shop') || urlLower.includes('store')) {
            detectedIndustry = "E-Commerce";
            keywords = ["retail", "online shopping", "sales"];
        } else if (urlLower.includes('law') || urlLower.includes('legal')) {
            detectedIndustry = "Legal Services";
        }

        setClientData(prev => ({ ...prev, industry: detectedIndustry }));

        const aiMsg = `Scan complete. \n\nBased on ${website}, this looks like a **${detectedIndustry}** business.\nKeywords found: ${keywords.join(', ') || 'General'}.\n\nIs the industry **${detectedIndustry}** correct?`;

        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: aiMsg }]);
        setStep('industry_confirm');
    };

    return (
        <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onCleanChat={() => { }}
                loading={loading}
                placeholder={step === 'scanning' ? "Scanning..." : "Type your answer..."}
            />
        </div>
    );
};

export default AddClientAssistant;
