
const API_KEY = "AIzaSyAMf7DeJikdWW2gnWrUvOihOMh94pOzwZg";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Generic function to call Gemini API
 * @param {string} prompt - The user prompt
 * @returns {Promise<string>} - The AI response text
 */
export const generateContent = async (prompt) => {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch from Gemini API');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No content returned from AI');
        }

        return text;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};

/**
 * Analyzes a client's business based on their name and website URL.
 * Returns a structured JSON object with industry and keywords.
 * @param {string} name 
 * @param {string} url 
 * @returns {Promise<{industry: string, keywords: string[], summary: string}>}
 */
export const analyzeClientWebsite = async (name, url) => {
    const prompt = `
    You are an expert digital marketing consultant.
    I need you to analyze a business based on its name and website URL (or just the name if the URL is not helpful/reachable, but assume the URL gives context).
    
    Business Name: "${name}"
    Website URL: "${url}"
    
    Task:
    1. Identify the specific Industry/Niche (e.g., "Dental Clinic", "E-Commerce Fashion", "SaaS B2B").
    2. Extract or infer 3-5 high-value SEO keywords relevant to this business.
    3. Write a very brief 1-sentence summary of what they likely do.

    IMPORTANT: Return the response ONLY as a raw JSON object with no markdown formatting or backticks.
    Format:
    {
        "industry": "string",
        "keywords": ["string", "string"],
        "summary": "string"
    }
    `;

    try {
        const resultText = await generateContent(prompt);
        // Clean up markdown code blocks if the AI adds them despite instructions
        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Analysis Failed", error);
        // Fallback if AI fails
        return {
            industry: "General Business",
            keywords: ["Business", "Services"],
            summary: "Could not automatically analyze. Please verify manually."
        };
    }
};

/**
 * Handles a chat conversation.
 * @param {string} latestMessage 
 * @param {Array} contextMessages - Previous messages for context (optional, simplified for now)
 * @param {string} systemContext - Context about the client
 * @returns {Promise<string>}
 */
export const chatWithAI = async (latestMessage, systemContext = "") => {
    const prompt = `
    System Context: ${systemContext}
    
    User: ${latestMessage}
    
    AI (You are a helpful Google Ads & SEO assistant. Be concise, professional, and helpful.):
    `;

    return await generateContent(prompt);
};
