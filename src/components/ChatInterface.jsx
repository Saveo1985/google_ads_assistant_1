import React, { useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User as UserIcon, Sparkles } from 'lucide-react';

const ChatInterface = ({
    messages,
    onSendMessage,
    onCleanChat,
    loading,
    placeholder = "Ask me anything...",
    isCleaning = false
}) => {
    const messagesEndRef = useRef(null);
    const [input, setInput] = React.useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={onCleanChat}
                    disabled={isCleaning || messages.length === 0}
                    className="btn-text"
                    title="Clean chat & save memory"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                >
                    {isCleaning ? <Sparkles size={16} className="spin" /> : <Trash2 size={16} />}
                    {isCleaning ? 'Summarizing...' : 'Clean & Remember'}
                </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.7 }}>
                        <Bot size={48} style={{ marginBottom: '1rem' }} />
                        <p>How can I help you today?</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        gap: '1rem',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                    }}>
                        {msg.role === 'ai' && (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} color="white" />
                            </div>
                        )}

                        <div style={{
                            background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            borderTopLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                            borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>

                        {msg.role === 'user' && (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2d2d30', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                <UserIcon size={18} />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start', maxWidth: '80%' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={18} color="white" />
                        </div>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span className="dot-pulse"></span><span className="dot-pulse" style={{ animationDelay: '0.2s' }}></span><span className="dot-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                    <input
                        className="input-field"
                        style={{ paddingRight: '3rem' }}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: input.trim() ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            cursor: input.trim() ? 'pointer' : 'default',
                            transition: 'color 0.2s'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
            <style>{`
        .dot-pulse { width: 6px; height: 6px; background: white; borderRadius: 50%; opacity: 0.6; animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default ChatInterface;
