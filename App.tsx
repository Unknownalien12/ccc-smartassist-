import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import LandingChatWidget from './components/LandingChatWidget';
import StudentSettings from './components/StudentSettings';
import { apiService } from './services/apiService';
import { AppState, ChatSession, Message, KnowledgeItem, ManualRule, SystemSettings } from './types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<AppState['view']>('LANDING');
  const [user, setUser] = useState<AppState['user']>(null);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [manualRules, setManualRules] = useState<ManualRule[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'CCC SmartAssist',
    themeColor: 'blue',
    apiKey: ''
  });

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form State
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, kb, rules, suggs] = await Promise.all([
          apiService.getSettings(),
          apiService.getKnowledge(),
          apiService.getRules(),
          apiService.getSuggestions()
        ]);
        setSettings(s);
        setKnowledgeBase(kb);
        setManualRules(rules);
        setSuggestions(suggs);
      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    };
    loadData();
  }, []);

  // Persist settings changes to API
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await apiService.saveSettings(newSettings);
  };

  const [isLandingChatOpen, setIsLandingChatOpen] = useState(false);

  // Mobile Menu State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const [stats, setStats] = useState({ kbCount: 0, ruleCount: 0, sessionCount: 0, messageCount: 0, userCount: 0 });

  // Load stats when entering Admin view
  useEffect(() => {
    if (view === 'ADMIN_DASHBOARD') {
      apiService.getStats().then(setStats).catch(console.error);
    }
  }, [view, knowledgeBase, manualRules]);

  // Derive display suggestions
  const displayFaqs = suggestions;

  // --- LOGIC ---

  const handleSendMessage = async (text: string, sessionId?: string) => {
    let targetSessionId = sessionId || currentSessionId;

    // Create new session if none exists
    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: text.substring(0, 30),
        messages: [],
        lastUpdated: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      targetSessionId = newSession.id;
      if (!sessionId) setCurrentSessionId(newSession.id);
    }

    // Immediately show user message in UI
    const userMsg: Message = { id: generateId(), role: 'user', content: text, timestamp: Date.now() };

    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === targetSessionId
          ? { ...s, messages: [...s.messages, userMsg], lastUpdated: Date.now() }
          : s
      );
      return updated;
    });

    setIsLoading(true);

    try {
      // Get current session state for history
      const currentSession = sessions.find(s => s.id === targetSessionId);
      const history = currentSession ? [...currentSession.messages, userMsg] : [userMsg];

      // Check for local instant response first (manual rules or exact KB match)
      const localRule = manualRules.find(r => r.active && r.trigger.toLowerCase() === text.toLowerCase());
      const instantAnswer = localRule?.response;

      let responseText: string;
      if (instantAnswer) {
        responseText = instantAnswer;
        // Simulate latency
        await new Promise(r => setTimeout(r, 600));
      } else {
        responseText = await apiService.sendMessage(
          targetSessionId!,
          text,
          history,
          user?.id || 'guest'
        );
      }

      // Add Bot Message to UI
      const botMsg: Message = {
        id: generateId(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setSessions(prev => {
        const updated = prev.map(s =>
          s.id === targetSessionId
            ? { ...s, messages: [...s.messages, botMsg], lastUpdated: Date.now() }
            : s
        );

        // Sync session title/lastUpdate with backend if user is logged in
        if (user) {
          const session = updated.find(s => s.id === targetSessionId);
          if (session) apiService.saveSession(session, user.id);
        }

        return updated;
      });

    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'model',
        content: "System uplink failed. Please check your connection and try again.",
        timestamp: Date.now(),
        isError: true
      };
      setSessions(prev => prev.map(s =>
        s.id === targetSessionId
          ? { ...s, messages: [...s.messages, errorMsg] }
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPERS ---
  const handleNewSession = () => {
    const newSession: ChatSession = { id: generateId(), title: 'New Inquiry', messages: [], lastUpdated: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setView('LANDING');
    setSessions([]);
    setCurrentSessionId(null);
  };

  // Load Sessions for User
  useEffect(() => {
    if (user) {
      apiService.getSessions(user.id, user.type === 'admin').then(setSessions);
    }
  }, [user]);

  const handleFeedback = async (messageId: string, feedback: number) => {
    setSessions(prev => prev.map(s => ({
      ...s,
      messages: s.messages.map(m => m.id === messageId ? { ...m, feedback } : m)
    })));
    await apiService.sendFeedback(messageId, feedback);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);

    if (currentSessionId === sessionId) {
      if (newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
      } else {
        const newSession: ChatSession = { id: generateId(), title: 'New Inquiry', messages: [], lastUpdated: Date.now() };
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
      }
    }

    try {
      if (user) {
        await apiService.deleteSession(sessionId);
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear ALL chat history? This cannot be undone.")) return;

    const sessionIds = sessions.map(s => s.id);
    const newSession: ChatSession = { id: generateId(), title: 'New Inquiry', messages: [], lastUpdated: Date.now() };
    setSessions([newSession]);
    setCurrentSessionId(newSession.id);

    try {
      if (user) {
        await Promise.all(sessionIds.map(id => apiService.deleteSession(id)));
      }
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  // --- VIEWS ---

  // Landing Page View
  const renderLanding = () => {
    return (
      <Layout themeColor={settings.themeColor}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-20 overflow-y-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
            Student Life, <br /><span className={`text-transparent bg-clip-text bg-gradient-to-r ${settings.themeColor === 'emerald' ? 'from-emerald-600 to-teal-600' : settings.themeColor === 'violet' ? 'from-violet-600 to-fuchsia-600' : 'from-blue-600 to-violet-600'}`}>Reimagined.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-100 px-4">
            Welcome to the official Cainta Catholic College intelligent support portal.
            Access grades, enrollment, and tuition data via our neural interface.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200 px-4">
            {['Enrollment', 'Tuition', 'Academics'].map((item) => (
              <div key={item} className="glass-panel p-6 rounded-3xl flex flex-col items-center hover:scale-105 transition-transform cursor-default">
                <div className={`w-12 h-12 ${settings.themeColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' : settings.themeColor === 'violet' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'} rounded-2xl mb-4 flex items-center justify-center font-bold`}>
                  {item[0]}
                </div>
                <h3 className="font-bold text-slate-800">{item}</h3>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300 w-full sm:w-auto px-4">
            <button
              onClick={() => setView('LOGIN_STUDENT')}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto"
            >
              Student Access
            </button>
            <button
              onClick={() => setView('LOGIN_ADMIN')}
              className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all w-full sm:w-auto"
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Chat Widget */}
        <LandingChatWidget
          systemName={settings.systemName}
          themeColor={settings.themeColor}
          isOpen={isLandingChatOpen}
          onToggle={() => setIsLandingChatOpen(!isLandingChatOpen)}
          messages={sessions.length > 0 ? sessions[0].messages : []}
          onSendMessage={(text) => handleSendMessage(text, sessions[0]?.id)}
          isLoading={isLoading}
          suggestions={displayFaqs}
          onFeedback={handleFeedback}
        />
      </Layout>
    );
  };

  // Login View
  const renderLogin = (type: 'student' | 'admin') => (
    <Layout themeColor={settings.themeColor}>
      <div className="flex-1 flex items-center justify-center p-6 min-h-[600px]">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">{type === 'student' ? 'Student Identity' : 'Admin Core'}</h2>
            <p className="text-slate-500 text-sm">Enter credentials to establish uplink.</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoginError(null);
            setIsLoggingIn(true);
            try {
              console.log("Attempting login for:", loginUsername, type);
              const res = await apiService.login(loginUsername, loginPassword, type);
              console.log("Login Response:", res);

              if (!res || !res.user) {
                console.error("Login response missing user object:", res);
                throw new Error("System synchronization failed: User data not found in response.");
              }

              setUser({
                type: res.user.role,
                id: res.user.id,
                name: res.user.fullName
              });
              setView(type === 'student' ? 'STUDENT_DASHBOARD' : 'ADMIN_DASHBOARD');
              setLoginUsername('');
              setLoginPassword('');
              if (type === 'student' && sessions.length === 0) handleNewSession();
            } catch (err: any) {
              console.error("Login Error:", err);
              setLoginError(err.message || 'Invalid credentials established.');
            } finally {
              setIsLoggingIn(false);
            }
          }} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {loginError}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              disabled={isLoggingIn}
              className={`w-full ${settings.themeColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' : settings.themeColor === 'violet' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'} text-white py-4 rounded-2xl font-bold shadow-lg transition-all mt-4 disabled:opacity-50`}
            >
              {isLoggingIn ? 'Establishing Uplink...' : 'Connect'}
            </button>
          </form>
          <button onClick={() => { setView('LANDING'); setLoginError(null); }} className="w-full text-center mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
            Cancel
          </button>
          {type === 'student' && (
            <div className="text-center mt-4">
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <button onClick={() => setView('REGISTER_STUDENT')} className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );

  // Registration View
  const renderRegister = () => (
    <Layout themeColor={settings.themeColor}>
      <div className="flex-1 flex items-center justify-center p-6 min-h-[600px]">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Student Registration</h2>
            <p className="text-slate-500 text-sm">Create your account to access the system.</p>
          </div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setRegisterError(null);
            setIsRegistering(true);
            try {
              const res = await apiService.register(registerUsername, registerPassword, registerFullName, 'student');
              if (!res || !res.user) {
                throw new Error("Account created but session establishment failed. Please login manually.");
              }
              setUser({
                type: res.user.role,
                id: res.user.id,
                name: res.user.fullName
              });
              setView('STUDENT_DASHBOARD');
              setRegisterUsername('');
              setRegisterPassword('');
              setRegisterFullName('');
              if (sessions.length === 0) handleNewSession();
            } catch (err: any) {
              setRegisterError(err.message || 'Identity registration failed.');
            } finally {
              setIsRegistering(false);
            }
          }} className="space-y-4">
            {registerError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {registerError}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
              <input
                type="text"
                value={registerFullName}
                onChange={(e) => setRegisterFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <input
                type="text"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Password</label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
                required
                minLength={6}
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-2">Minimum 6 characters</p>
            </div>
            <button
              disabled={isRegistering}
              className={`w-full ${settings.themeColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30' : settings.themeColor === 'violet' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'} text-white py-4 rounded-2xl font-bold shadow-lg transition-all mt-4 disabled:opacity-50`}
            >
              {isRegistering ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <button onClick={() => { setView('LOGIN_STUDENT'); setRegisterError(null); }} className="w-full text-center mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
            Back to Login
          </button>
        </div>
      </div>
    </Layout>
  );

  // --- RENDER MAIN ---
  if (view === 'LANDING') return renderLanding();
  if (view === 'LOGIN_STUDENT') return renderLogin('student');
  if (view === 'LOGIN_ADMIN') return renderLogin('admin');
  if (view === 'REGISTER_STUDENT') return renderRegister();

  if (view === 'ADMIN_DASHBOARD') {
    return (
      <AdminDashboard
        knowledgeBase={knowledgeBase}
        manualRules={manualRules}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onAddKnowledge={async (k) => {
          const newItem = { ...k, id: generateId(), dateAdded: Date.now() };
          setKnowledgeBase(p => [newItem, ...p]);
          await apiService.addKnowledge(newItem);
        }}
        onDeleteKnowledge={async (id) => {
          setKnowledgeBase(p => p.filter(k => k.id !== id));
          await apiService.deleteKnowledge(id);
        }}
        onAddRule={async (r) => {
          const newRule = { ...r, id: generateId() };
          setManualRules(p => [newRule, ...p]);
          await apiService.addRule(newRule);
        }}
        onDeleteRule={async (id) => {
          setManualRules(p => p.filter(r => r.id !== id));
          await apiService.deleteRule(id);
        }}
        onLogout={handleLogout}
        onRefreshSuggestions={async () => {
          const sugs = await apiService.getSuggestions();
          setSuggestions(sugs);
        }}
        apiStatus={isOffline ? 'offline' : 'online'}
        userName={user?.name}
        stats={stats}
      />
    );
  }

  // Student Dashboard
  const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];

  return (
    <Layout themeColor={settings.themeColor} fullScreen={true}>
      <div className="flex h-screen overflow-hidden p-0 sm:p-2 md:p-4 gap-0 md:gap-4 relative">

        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMobileSidebarOpen(false)}
        />

        {/* Sidebar (Responsive Wrapper) */}
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              setCurrentSessionId(id);
              setView('STUDENT_DASHBOARD');
              setIsMobileSidebarOpen(false);
            }}
            onNewSession={() => {
              handleNewSession();
              setView('STUDENT_DASHBOARD');
            }}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
            onLogout={handleLogout}
            userType={user?.type === 'admin' ? 'admin' : 'student'}
            userName={user?.name}
            themeColor={settings.themeColor}
            systemName={settings.systemName}
            onClose={() => setIsMobileSidebarOpen(false)}
            onSettingsClick={() => {
              setView('STUDENT_SETTINGS');
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>

        {/* Chat Interface or Settings */}
        <div className="flex-1 h-full bg-white/50 backdrop-blur-xl sm:rounded-[2.5rem] border-l md:border border-white/50 shadow-2xl overflow-hidden relative flex flex-col">
          {view === 'STUDENT_SETTINGS' ? (
            <StudentSettings
              userId={user?.id || ''}
              onClose={() => setView('STUDENT_DASHBOARD')}
              themeColor={settings.themeColor}
            />
          ) : (
            <ChatInterface
              systemName={settings.systemName}
              themeColor={settings.themeColor}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isOffline={isOffline}
              suggestions={displayFaqs}
              onToggleSidebar={() => setIsMobileSidebarOpen(true)}
              onFeedback={handleFeedback}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;