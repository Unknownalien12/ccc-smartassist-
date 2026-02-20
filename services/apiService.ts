import { KnowledgeItem, ManualRule, SystemSettings, ChatSession, Message } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/backend/api.php';

const getAuthHeaders = () => {
    const token = localStorage.getItem('ccc_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiService = {
    // Auth
    login: async (username: string, password: string, role: 'student' | 'admin'): Promise<any> => {
        const res = await fetch(`${API_BASE}?request=login`, {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Login failed');
        }
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('ccc_token', data.token);
        }
        return data;
    },
    register: async (username: string, password: string, fullName: string, role: string = 'student'): Promise<any> => {
        const res = await fetch(`${API_BASE}?request=register`, {
            method: 'POST',
            body: JSON.stringify({ username, password, fullName, role })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Registration failed');
        }
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('ccc_token', data.token);
        }
        return data;
    },
    logout: () => {
        localStorage.removeItem('ccc_token');
    },

    // Settings
    getSettings: async (): Promise<SystemSettings> => {
        const res = await fetch(`${API_BASE}?request=settings`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        return {
            systemName: data.system_name,
            themeColor: data.theme_color,
            apiKey: data.api_key
        };
    },
    saveSettings: async (settings: SystemSettings) => {
        await fetch(`${API_BASE}?request=settings`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
    },

    getStats: async () => {
        const res = await fetch(`${API_BASE}?request=stats`, {
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    // Knowledge Base
    getKnowledge: async (): Promise<KnowledgeItem[]> => {
        const res = await fetch(`${API_BASE}?request=knowledge`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return Array.isArray(data) ? data.map((item: any) => ({
            ...item,
            dateAdded: Number(item.date_added)
        })) : [];
    },
    addKnowledge: async (item: KnowledgeItem) => {
        await fetch(`${API_BASE}?request=knowledge`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
    },
    deleteKnowledge: async (id: string) => {
        await fetch(`${API_BASE}?request=knowledge&id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
    },

    // Manual Rules
    getRules: async (): Promise<ManualRule[]> => {
        const res = await fetch(`${API_BASE}?request=rules`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.error) return [];
        return Array.isArray(data) ? data.map((item: any) => ({
            id: item.id,
            trigger: item.keyword,
            response: item.response,
            active: Boolean(Number(item.active))
        })) : [];
    },
    addRule: async (rule: ManualRule) => {
        await fetch(`${API_BASE}?request=rules`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rule)
        });
    },
    deleteRule: async (id: string) => {
        await fetch(`${API_BASE}?request=rules&id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
    },

    // FAQs
    getFAQs: async (): Promise<any[]> => {
        const res = await fetch(`${API_BASE}?request=faqs&t=${Date.now()}`);
        const data = await res.json();
        return Array.isArray(data) ? data.map((item: any) => ({
            id: item.id,
            question: item.question,
            dateAdded: Number(item.date_added)
        })) : [];
    },
    addFAQ: async (question: string) => {
        const res = await fetch(`${API_BASE}?request=faqs`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Add FAQ failed' }));
            throw new Error(err.error || 'Add FAQ failed');
        }
        return await res.json();
    },
    updateFAQ: async (id: string, question: string) => {
        const res = await fetch(`${API_BASE}?request=faqs`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, question, action: 'update' })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Update FAQ failed' }));
            throw new Error(err.error || 'Update FAQ failed');
        }
        return await res.json();
    },
    deleteFAQ: async (id: string) => {
        const res = await fetch(`${API_BASE}?request=faqs&id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Delete FAQ failed' }));
            throw new Error(err.error || 'Delete FAQ failed');
        }
        return await res.json();
    },

    // Chat
    sendMessage: async (sessionId: string, message: string, history: Message[], userId: string = 'guest'): Promise<string> => {
        try {
            const res = await fetch(`${API_BASE}?request=chat`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId,
                    message,
                    history,
                    userId,
                    systemInstruction: SYSTEM_INSTRUCTION
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            if (!data || !data.response) {
                throw new Error('Invalid response from server');
            }

            return data.response;
        } catch (error) {
            console.error('sendMessage error:', error);
            throw error;
        }
    },

    // Sessions
    getSessions: async (userId: string, isAdmin: boolean = false): Promise<ChatSession[]> => {
        const res = await fetch(`${API_BASE}?request=sessions&userId=${userId}${isAdmin ? '&admin=true' : ''}`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.error) return [];
        return Array.isArray(data) ? data.filter(s => s).map((s: any) => ({
            ...s,
            lastUpdated: Number(s.last_updated),
            messages: (s.messages || []).map((m: any) => ({
                ...m,
                timestamp: Number(m.timestamp)
            }))
        })) : [];
    },
    saveSession: async (session: ChatSession, userId: string) => {
        await fetch(`${API_BASE}?request=sessions`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...session,
                userId
            })
        });
    },
    deleteSession: async (id: string) => {
        await fetch(`${API_BASE}?request=sessions`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, delete: true })
        });
    },

    sendFeedback: async (messageId: string, feedback: number) => {
        await fetch(`${API_BASE}?request=feedback`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messageId, feedback })
        });
    },

    // User Management (Admin)
    getUsers: async (): Promise<any[]> => {
        const res = await fetch(`${API_BASE}?request=users`, {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return Array.isArray(data) ? data.filter(u => u).map((u: any) => ({
            id: u.id,
            username: u.username,
            role: u.role,
            fullName: u.full_name,
            email: u.email,
            studentId: u.student_id,
            course: u.course,
            yearLevel: u.year_level
        })) : [];
    },
    updateUser: async (user: any) => {
        await fetch(`${API_BASE}?request=users`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...user, action: 'update' })
        });
    },
    deleteUser: async (id: string) => {
        await fetch(`${API_BASE}?request=users&id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
    },

    // Student Profile
    getStudentProfile: async (id: string): Promise<any> => {
        const res = await fetch(`${API_BASE}?request=profile&id=${id}`, {
            headers: getAuthHeaders()
        });
        const u = await res.json();
        if (u.error) throw new Error(u.error);
        return {
            id: u.id,
            username: u.username,
            role: u.role,
            fullName: u.full_name,
            email: u.email,
            studentId: u.student_id,
            course: u.course,
            yearLevel: u.year_level
        };
    },
    updateStudentProfile: async (profile: any) => {
        await fetch(`${API_BASE}?request=profile`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
    },

    getSuggestions: async (): Promise<string[]> => {
        const res = await fetch(`${API_BASE}?request=suggestions`);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    }
};
