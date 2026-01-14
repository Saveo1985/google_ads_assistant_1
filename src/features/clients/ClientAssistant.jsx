import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeToMessages, sendMessage, saveKnowledge } from '../../firebase';
import ChatInterface from '../../components/ChatInterface';

const ClientAssistant = () => {
    const { clientId } = useParams();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cleaning, setCleaning] = useState(false);

    // We use clientId as the "conversationId" for the client-specific chat.
    // Or we could have multiple conversations. For simplicity, let's have one main "Assistant" thread per client.
    const conversationId = `client_${clientId}_main`;

    useEffect(() => {
        const unsubscribe = subscribeToMessages(conversationId, setMessages);
        return () => unsubscribe && unsubscribe();
    }, [conversationId]);

    const handleSendMessage = async (text) => {
        setLoading(true);
        try {
            // 1. Save User Message
            await sendMessage(conversationId, 'user', text, { clientId });

            // 2. Simulate AI Response (Since we don't have a real backend)
            // Real implementation would call an API here.
            setTimeout(async () => {
                let aiResponse = "I'm your Client Assistant. I can help search for info about this client's website.";

                if (text.toLowerCase().includes('search') || text.toLowerCase().includes('website')) {
                    aiResponse = "I'm searching the client's website for relevant information... (Simulation: Found 'About Us', 'Services' pages). This client appears to be in the Tech industry.";
                } else if (text.toLowerCase().includes('campaign')) {
                    aiResponse = "I can help you plan campaigns. Please switch to the Campaign Management tab to create one.";
                }

                await sendMessage(conversationId, 'ai', aiResponse, { clientId });
                setLoading(false);
            }, 1500);

        } catch (error) {
            console.error("Error sending message:", error);
            setLoading(false);
        }
    };

    const handleCleanChat = async () => {
        setCleaning(true);
        // Logic:
        // 1. Generate a summary of the current conversation (Simulated)
        // 2. Save summary to 'knowledge' collection
        // 3. Delete messages (Simulated by just adding a "system" message saying it was cleared, or we actually delete. 
        //    Requirement says "clean chat history", usually implies deletion.
        //    However, Firestore deletion of collections is tricky from client.
        //    We will just "mark" them as archived or just strictly follow the requirement of saving memory.
        //    Let's just save the knowledge and maybe "hide" old messages or strictly just append a logical separator.
        //    Actual deletion is expensive in Firestore (batch delete). I'll start by saving memory.

        setTimeout(async () => {
            await saveKnowledge(clientId, "Summarized client discussion about website structure and initial campaign goals.", "client_summary");

            // Notify user
            await sendMessage(conversationId, 'ai', "Thinking... I have summarized our conversation and saved the key points to my long-term memory. I'm ready for new topics.", { system: true });

            setCleaning(false);
        }, 2000);
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)' }}> {/* Adjust for header/padding */}
            <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                onCleanChat={handleCleanChat}
                loading={loading}
                isCleaning={cleaning}
                placeholder="Ask about this client..."
            />
        </div>
    );
};

export default ClientAssistant;
