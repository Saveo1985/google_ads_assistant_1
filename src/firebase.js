import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    setDoc,
    getDocs,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    enableIndexedDbPersistence
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyDSRyiURMO0n0wOHPAlt6T3o75mEXUjmZc",
    authDomain: "up-seo-apps.firebaseapp.com",
    projectId: "up-seo-apps",
    storageBucket: "up-seo-apps.firebasestorage.app",
    messagingSenderId: "222992510170",
    appId: "1:222992510170:web:97cdab464693927b40c9e3",
    measurementId: "G-L1VKC3WVF6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log("Persistence failed: Multiple tabs open");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log("Persistence failed: Not supported");
    }
});

// Authentication Logic
let isAuthReady = false;
let authPromiseResolver;
const authPromise = new Promise((resolve) => {
    authPromiseResolver = resolve;
});

// Timeout fallback: If auth doesn't initialize in 3s, resolve anyway to allow offline functionality
setTimeout(() => {
    if (!isAuthReady) {
        console.warn("Auth initialization timed out, proceeding in offline/guest mode.");
        isAuthReady = true;
        if (authPromiseResolver) authPromiseResolver(null);
    }
}, 3000);

signInAnonymously(auth).catch((error) => {
    console.error("Auth failed (likely offline):", error);
    // If auth fails explicitly (e.g. network error), resolve immediately
    if (authPromiseResolver) authPromiseResolver(null);
});

onAuthStateChanged(auth, (user) => {
    if (user && !isAuthReady) {
        console.log("Authenticated as", user.uid);
        isAuthReady = true;
        authPromiseResolver(user);
    }
});

export const waitForAuth = () => authPromise;

// App ID Management
const STORAGE_KEY = 'google_ads_assistant_app_id';

export const getAppId = () => {
    let appId = localStorage.getItem(STORAGE_KEY);
    if (!appId) {
        appId = `google_ads_assistant_${uuidv4()}`;
        localStorage.setItem(STORAGE_KEY, appId);
    }
    return appId;
};

const APP_ID = getAppId();

// Firestore Helpers - Scoped to apps/{APP_ID}

const getAppCollection = (subPath) => {
    return collection(db, `apps/${APP_ID}/${subPath}`);
};

// --- Clients ---

export const addClient = async (clientData) => {
    await waitForAuth();
    const clientsRef = getAppCollection('clients');
    return addDoc(clientsRef, {
        ...clientData,
        appId: APP_ID,
        createdAt: new Date(),
    });
};

export const subscribeToClients = (callback) => {
    waitForAuth().then(() => {
        const clientsRef = getAppCollection('clients');
        const q = query(clientsRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(clients);
        });
    });
};

// --- Campaigns ---

export const addCampaign = async (clientId, campaignData) => {
    await waitForAuth();
    const campaignsRef = getAppCollection('campaigns');
    return addDoc(campaignsRef, {
        ...campaignData,
        clientId,
        appId: APP_ID,
        createdAt: new Date(),
    });
};

export const updateCampaign = async (campaignId, updates) => {
    await waitForAuth();
    const campaignRef = doc(db, `apps/${APP_ID}/campaigns/${campaignId}`);
    return setDoc(campaignRef, updates, { merge: true });
};

export const subscribeToCampaigns = (clientId, callback) => {
    waitForAuth().then(() => {
        const campaignsRef = getAppCollection('campaigns');
        const q = query(campaignsRef, where("clientId", "==", clientId), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(campaigns);
        });
    });
};

export const subscribeToAllCampaigns = (callback) => {
    waitForAuth().then(() => {
        const campaignsRef = getAppCollection('campaigns');
        const q = query(campaignsRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(campaigns);
        });
    });
};

// --- Chat / Assistant ---

export const sendMessage = async (conversationId, role, content, meta = {}) => {
    await waitForAuth();
    const messagesRef = getAppCollection('conversations');
    return addDoc(messagesRef, {
        conversationId,
        role, // 'user' | 'ai'
        content,
        ...meta, // e.g., for CSV context or attachments
        appId: APP_ID,
        timestamp: new Date(),
        createdAt: new Date(),
    });
};

export const subscribeToMessages = (conversationId, callback) => {
    waitForAuth().then(() => {
        const messagesRef = getAppCollection('conversations');
        const q = query(
            messagesRef,
            where("conversationId", "==", conversationId),
            orderBy("timestamp", "asc")
        );
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
    });
};

// --- Memory / Knowledge ---

export const saveKnowledge = async (entityId, summary, type = 'general') => {
    await waitForAuth();
    const knowledgeRef = getAppCollection('knowledge');
    return addDoc(knowledgeRef, {
        entityId, // clientId or campaignId
        summary,
        type,
        appId: APP_ID,
        createdAt: new Date()
    });
};

// --- Tasks ---

export const addTask = async (campaignId, description) => {
    await waitForAuth();
    const tasksRef = getAppCollection('tasks');
    return addDoc(tasksRef, {
        description,
        campaignId: campaignId || 'general', // Optional link to campaign
        status: 'pending',
        appId: APP_ID,
        createdAt: new Date()
    });
};

export const subscribeToTasks = (callback) => {
    waitForAuth().then(() => {
        const tasksRef = getAppCollection('tasks');
        const q = query(tasksRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(tasks);
        });
    });
};

// Export app and auth for direct usage if needed
export { app, auth, db };
