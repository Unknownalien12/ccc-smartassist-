import React, { useState } from 'react';
import { KnowledgeItem, ManualRule, SystemSettings } from '../types';
import { apiService } from '../services/apiService';
import { Trash2, Plus, FileText, Database, Save, Upload, Loader2, FileUp, Zap, Activity, Settings as SettingsIcon, LayoutTemplate, BarChart3, CheckCircle2, Users, Clock, TrendingUp, ArrowDownRight, Menu, X, Key } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Extract named exports safely
const GlobalWorkerOptions = (pdfjsLib as any).GlobalWorkerOptions || (pdfjsLib as any).default?.GlobalWorkerOptions;
const getDocument = (pdfjsLib as any).getDocument || (pdfjsLib as any).default?.getDocument;

if (GlobalWorkerOptions) {
  // @ts-ignore
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface AdminDashboardProps {
  knowledgeBase: KnowledgeItem[];
  manualRules: ManualRule[];
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onAddKnowledge: (item: Omit<KnowledgeItem, 'id' | 'dateAdded'>) => void;
  onDeleteKnowledge: (id: string) => void;
  onAddRule: (rule: Omit<ManualRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
  onLogout: () => void;
  onRefreshSuggestions?: () => void;
  apiStatus: 'online' | 'offline';

  userName?: string;
  stats?: {
    kbCount: number;
    ruleCount: number;
    sessionCount: number;
    messageCount: number;
    userCount: number;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  knowledgeBase,
  manualRules,
  settings,
  onUpdateSettings,
  onAddKnowledge,
  onDeleteKnowledge,
  onAddRule,
  onDeleteRule,
  onLogout,
  onRefreshSuggestions,
  apiStatus,
  userName,
  stats = { kbCount: 0, ruleCount: 0, sessionCount: 0, messageCount: 0, userCount: 0 }
}) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'rules' | 'brain' | 'settings' | 'users'>('faqs');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Fetch users when tab becomes active
  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUser = async (user: any) => {
    try {
      await apiService.updateUser(user);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const [trigger, setTrigger] = useState('');
  const [response, setResponse] = useState('');

  // PDF State
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  // Settings State local buffer
  const [localSystemName, setLocalSystemName] = useState(settings.systemName);
  const [localApiKey, setLocalApiKey] = useState(settings.apiKey || '');

  // Theme Config
  const themes = {
    blue: {
      activeTab: 'bg-blue-600 text-white shadow-blue-900/50',
      accentText: 'text-blue-600',
      lightBg: 'bg-blue-50',
      lightText: 'text-blue-700',
      ring: 'focus:ring-blue-500',
      button: 'bg-slate-900',
      primaryBtn: 'bg-blue-600 hover:bg-blue-700',
      borderHover: 'group-hover:border-blue-400',
      chartBar: 'bg-blue-500',
      gradient: 'from-blue-500 to-indigo-600',
      tabIcon: 'text-blue-400'
    },
    emerald: {
      activeTab: 'bg-emerald-600 text-white shadow-emerald-900/50',
      accentText: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      lightText: 'text-emerald-700',
      ring: 'focus:ring-emerald-500',
      button: 'bg-slate-900',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700',
      borderHover: 'group-hover:border-emerald-400',
      chartBar: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      tabIcon: 'text-emerald-400'
    },
    violet: {
      activeTab: 'bg-violet-600 text-white shadow-violet-900/50',
      accentText: 'text-violet-600',
      lightBg: 'bg-violet-50',
      lightText: 'text-violet-700',
      ring: 'focus:ring-violet-500',
      button: 'bg-slate-900',
      primaryBtn: 'bg-violet-600 hover:bg-violet-700',
      borderHover: 'group-hover:border-violet-400',
      chartBar: 'bg-violet-500',
      gradient: 'from-violet-500 to-fuchsia-600',
      tabIcon: 'text-violet-400'
    }
  };

  const theme = themes[settings.themeColor as keyof typeof themes] || themes.blue;

  // --- Handlers ---
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trigger || !response) return;
    onAddRule({ trigger: trigger.toLowerCase(), response, active: true });
    setTrigger('');
    setResponse('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setDocTitle(file.name);
    setIsProcessingPdf(true);
    setDocContent('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!getDocument) throw new Error("PDF.js not loaded");

      const loadingTask = getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // @ts-ignore
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `[Page ${i}]\n${pageText}\n\n`;
      }
      setDocContent(fullText.trim());
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to extract text.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleSavePdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;
    onAddKnowledge({
      question: `Document: ${docTitle}`,
      answer: docContent,
      category: 'general',
      source: 'pdf'
    });
    setDocTitle('');
    setDocContent('');
    alert('Document synced to Brain.');
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      systemName: localSystemName,
      apiKey: localApiKey
    });
    alert('System Configuration Updated');
  };

  // FAQ State
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaq, setNewFaq] = useState('');
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [loadingFaqs, setLoadingFaqs] = useState(false);

  // Fetch FAQs when tab is active
  React.useEffect(() => {
    if (activeTab === 'faqs') {
      fetchFaqs();
    }
  }, [activeTab]);

  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const data = await apiService.getFAQs();
      console.log("Fetched FAQs:", data);
      setFaqs(data);
      if (onRefreshSuggestions) onRefreshSuggestions();
    } catch (error) {
      console.error("Failed to fetch FAQs", error);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq) return;
    try {
      await apiService.addFAQ(newFaq);
      setNewFaq('');
      fetchFaqs();
    } catch (error) {
      console.error("Failed to add FAQ", error);
      alert("Failed to add FAQ. See console for details.");
    }
  };

  const handleUpdateFaq = async () => {
    if (!editingFaq || !editingFaq.question) return;
    try {
      await apiService.updateFAQ(editingFaq.id, editingFaq.question);
      setEditingFaq(null);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to update FAQ", error);
      alert("Failed to update FAQ. See console for details.");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    console.log("Delete button clicked for ID:", id);
    if (!confirm("Are you sure you want to delete this suggestion chip?")) return;
    try {
      const result = await apiService.deleteFAQ(id);
      console.log("Delete API result:", result);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ", error);
      alert("Failed to delete FAQ. See console for details.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-start">
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">{userName || 'Admin Core'}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">System Control</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => { setActiveTab('faqs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'faqs' ? theme.activeTab : 'hover:bg-slate-800'
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Frontend FAQs
          </button>
          <button
            onClick={() => { setActiveTab('rules'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'rules' ? theme.activeTab : 'hover:bg-slate-800'
              }`}
          >
            <Zap className="w-4 h-4" />
            Manual Rules
          </button>
          <button
            onClick={() => { setActiveTab('brain'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'brain' ? theme.activeTab : 'hover:bg-slate-800'
              }`}
          >
            <Database className="w-4 h-4" />
            Brain Sync (PDF)
          </button>
          <button
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? theme.activeTab : 'hover:bg-slate-800'
              }`}
          >
            <Users className="w-4 h-4" />
            User Management
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'settings' ? theme.activeTab : 'hover:bg-slate-800'
              }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings & Reports
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 relative flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex justify-between items-center bg-white border-b border-slate-200 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 active:scale-95 transition-all shadow-sm"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <Activity className={`w-3.5 h-3.5 ${apiStatus === 'online' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              SYSTEM {apiStatus}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                {activeTab === 'faqs' && 'Frontend Suggestion Chips'}
                {activeTab === 'rules' && 'Manual Override Rules'}
                {activeTab === 'brain' && 'Knowledge Base Sync'}
                {activeTab === 'settings' && 'System Configuration'}
                {activeTab === 'users' && 'User Management'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                {activeTab === 'faqs' && 'Manage the clickable question chips shown to users on the chat interface.'}
                {activeTab === 'rules' && 'Define exact responses for frequent questions or high-priority triggers.'}
                {activeTab === 'brain' && 'Upload documents to expand the neural network.'}
                {activeTab === 'settings' && 'Manage appearance, identity, and view analytics.'}
                {activeTab === 'users' && 'Manage student and admin accounts.'}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Activity className={`w-4 h-4 ${apiStatus === 'online' ? 'text-emerald-500' : 'text-red-500'}`} />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                System Status: {apiStatus}
              </span>
            </div>
          </div>

          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus className={`w-5 h-5 ${theme.accentText}`} />
                    New Question Chip
                  </h3>
                  <form onSubmit={handleAddFaq} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Question Text</label>
                      <input
                        type="text"
                        value={newFaq}
                        onChange={(e) => setNewFaq(e.target.value)}
                        placeholder="e.g., How do I enroll?"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all focus:outline-none focus:ring-2 ${theme.ring}`}
                        maxLength={50}
                      />
                      <p className="text-[10px] text-slate-400 mt-1 text-right">{newFaq.length}/50</p>
                    </div>
                    <button type="submit" disabled={!newFaq} className={`w-full ${theme.primaryBtn} text-white py-3 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50`}>
                      Add Chip
                    </button>
                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                      Note: Clicking this chip will send the question to the AI, which answers based on the Knowledge Base.
                    </p>
                  </form>
                </div>
              </div>

              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 px-2">Active Suggestions</h4>
                {loadingFaqs ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map(faq => (
                      <div key={faq.id} className="group bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center transition-all hover:shadow-md hover:border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${theme.lightBg} ${theme.accentText} flex items-center justify-center font-bold`}>?</div>
                          <span className="font-semibold text-slate-700">{faq.question}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingFaq(faq)} className="text-slate-300 hover:text-blue-500 p-2 transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteFaq(faq.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {faqs.length === 0 && (
                      <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                        No suggestions active. Add one to help users get started!
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Edit FAQ Modal */}
              {editingFaq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Suggestion</h3>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all focus:outline-none focus:ring-2 mb-4"
                      maxLength={50}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateFaq}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold transition-all"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-xl font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus className={`w-5 h-5 ${theme.accentText}`} />
                    New FAQ/Rule
                  </h3>
                  <form onSubmit={handleAddRule} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Question / Keyword</label>
                      <input
                        type="text"
                        value={trigger}
                        onChange={(e) => setTrigger(e.target.value)}
                        placeholder="e.g., How to enroll?"
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all focus:outline-none focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Answer</label>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={6}
                        placeholder="Enter the official school response..."
                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all focus:outline-none focus:ring-2 ${theme.ring}`}
                      />
                    </div>
                    <button type="submit" disabled={!trigger || !response} className={`w-full ${theme.primaryBtn} text-white py-3 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50`}>
                      Add to Knowledge
                    </button>
                  </form>
                </div>
              </div>

              {/* List */}
              <div className="lg:col-span-2 space-y-4">
                {manualRules.map(rule => (
                  <div key={rule.id} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 ${theme.lightBg} ${theme.lightText} text-[10px] font-bold uppercase tracking-wider rounded-md`}>Question</span>
                        <span className="font-mono text-sm font-bold text-slate-800">{rule.trigger}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{rule.response}</p>
                    </div>
                    <button onClick={() => onDeleteRule(rule.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {manualRules.length === 0 && (
                  <div className="text-center py-12 text-slate-400">No active rules deployed.</div>
                )}
              </div>
            </div>
          )}

          {/* BRAIN SYNC TAB */}
          {activeTab === 'brain' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
                <div className={`w-20 h-20 ${theme.lightBg} ${theme.accentText} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <FileUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload PDF Handbook</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Drag and drop school handbooks or office manuals. The AI will learn these guidelines and answer student queries based ONLY on this content.
                </p>

                <div className="relative group mb-8">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed border-slate-200 ${theme.borderHover} rounded-2xl p-8 transition-colors bg-slate-50 group-hover:bg-opacity-50`}>
                    <p className={`text-sm font-bold text-slate-400 group-hover:${theme.accentText}`}>Click to Select PDF</p>
                  </div>
                </div>

                {isProcessingPdf && (
                  <div className={`flex items-center justify-center gap-2 ${theme.accentText} font-bold animate-pulse`}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    EXTRACTING KNOWLEDGE...
                  </div>
                )}

                {(docTitle || docContent) && !isProcessingPdf && (
                  <div className="text-left animate-in slide-in-from-bottom-4 fade-in">
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-semibold"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learned Content</label>
                      <textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        rows={8}
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-600"
                      />
                    </div>
                    <button onClick={handleSavePdf} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      ADD TO AI DATABASE
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-12">
                <h4 className="font-bold text-slate-800 mb-4 px-2">Knowledge Base Index</h4>
                <div className="space-y-3">
                  {knowledgeBase.filter(k => k.source === 'pdf').map(k => (
                    <div key={k.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <span className="font-medium text-slate-700 text-sm truncate max-w-[200px]">{k.question.replace('Document: ', '')}</span>
                      </div>
                      <button onClick={() => onDeleteKnowledge(k.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className={`w-5 h-5 ${theme.accentText}`} />
                  Account Management
                </h3>
                <button onClick={fetchUsers} className={`p-2 hover:bg-slate-50 rounded-lg transition-colors ${loadingUsers ? 'animate-spin' : ''}`}>
                  <Activity className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Identity</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status / ID</th>
                      <th className="px-6 py-4">Course / Year</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.role === 'admin' ? 'from-slate-700 to-slate-800' : theme.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                              {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{u.fullName || 'No Name'}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">{u.email || u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : theme.lightBg + ' ' + theme.lightText}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-slate-500">{u.studentId || 'INTERNAL'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600">{u.course || '-'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.yearLevel || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Edit Details</h3>
                    <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                      <input
                        type="text"
                        value={editingUser.fullName || ''}
                        onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => handleUpdateUser(editingUser)}
                      className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Update Identity
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-6 bg-slate-50 text-slate-500 py-3 rounded-xl font-bold border border-slate-100 hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <LayoutTemplate className={`w-6 h-6 ${theme.accentText}`} />
                  <h3 className="text-xl font-bold text-slate-800">System Identity & Theme</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">System Name</label>
                    <input
                      type="text"
                      value={localSystemName}
                      onChange={(e) => setLocalSystemName(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold transition-all focus:outline-none focus:ring-2 ${theme.ring}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Key className="w-3 h-3" />
                      Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={localApiKey}
                      onChange={(e) => setLocalApiKey(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold transition-all focus:outline-none focus:ring-2 ${theme.ring}`}
                    />
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors mt-4"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className={`w-6 h-6 ${theme.accentText}`} />
                  <h3 className="text-xl font-bold text-slate-800">System Analytics</h3>
                </div>
                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center hover:shadow-md transition-shadow group relative overflow-hidden">
                      <div className="flex justify-center mb-2 text-slate-300 group-hover:text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Accounts</p>
                      <p className={`text-2xl font-black ${theme.accentText}`}>{stats.userCount}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center hover:shadow-md transition-shadow group">
                      <div className="flex justify-center mb-2 text-slate-300 group-hover:text-slate-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chat Sessions</p>
                      <p className="text-2xl font-black text-slate-700">{stats.sessionCount}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-2xl text-center text-white relative overflow-hidden group">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Messages</p>
                    <p className="text-5xl font-black mt-2">{stats.messageCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;