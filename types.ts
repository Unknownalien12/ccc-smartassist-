export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
  feedback?: number; // 1 for up, -1 for down
}

export interface ManualRule {
  id: string;
  trigger: string; // Keyword or phrase
  response: string;
  active: boolean;
}

export interface KnowledgeItem {
  id: string;
  question: string; // Title/Topic
  answer: string;   // Content/Extracted Text
  category: 'enrollment' | 'general' | 'tuition' | 'scholarship' | 'policy' | 'academics';
  source: 'manual' | 'pdf' | 'system';
  dateAdded: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface StudentProfile {
  id: string;
  username: string; // Added username
  fullName: string;
  email?: string;
  studentId?: string;
  course?: string;
  yearLevel?: string;
  role: 'student' | 'admin';
}

export type ViewState = 'LANDING' | 'LOGIN_STUDENT' | 'LOGIN_ADMIN' | 'REGISTER_STUDENT' | 'STUDENT_DASHBOARD' | 'ADMIN_DASHBOARD' | 'STUDENT_SETTINGS';

export interface SystemSettings {
  systemName: string;
  themeColor: 'blue' | 'emerald' | 'violet';
  apiKey?: string;
}

export interface FAQ {
  id: string;
  question: string;
  dateAdded: number;
}

export interface AppState {
  view: ViewState;
  currentSessionId: string | null;
  sessions: ChatSession[];
  knowledgeBase: KnowledgeItem[];
  manualRules: ManualRule[];
  faqQuestions: FAQ[];
  isLoading: boolean;
  apiStatus: 'online' | 'offline';
  settings: SystemSettings;

  isLandingChatOpen: boolean;
  user: {
    type: 'student' | 'admin' | 'guest';
    name?: string;
    id?: string;
  } | null;
}