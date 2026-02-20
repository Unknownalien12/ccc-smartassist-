import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { apiService } from '../services/apiService';
import { User, Mail, Hash, BookOpen, GraduationCap, Save, Loader2, ArrowLeft } from 'lucide-react';

interface StudentSettingsProps {
    userId: string;
    onClose: () => void;
    themeColor: 'blue' | 'emerald' | 'violet';
}

const StudentSettings: React.FC<StudentSettingsProps> = ({ userId, onClose, themeColor }) => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiService.getStudentProfile(userId);
                setProfile(data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);
        try {
            await apiService.updateStudentProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const themeClasses = {
        blue: 'bg-blue-600 hover:bg-blue-700 ring-blue-500',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-500',
        violet: 'bg-violet-600 hover:bg-violet-700 ring-violet-500',
    };

    const accentText = {
        blue: 'text-blue-600',
        emerald: 'text-emerald-600',
        violet: 'text-violet-600',
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className={`w-8 h-8 animate-spin ${accentText[themeColor]}`} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Native-style Mobile Header */}
            <div className="h-16 flex items-center px-4 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-bold">Back</span>
                </button>
                <div className="ml-4">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Account Details</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
                <div className="max-w-2xl mx-auto w-full">
                    {/* ... rest of the card ... */}
                    <div className={`h-32 bg-gradient-to-r ${themeColor === 'blue' ? 'from-blue-500 to-indigo-600' : themeColor === 'emerald' ? 'from-emerald-500 to-teal-600' : 'from-violet-500 to-fuchsia-600'}`} />

                    <div className="px-8 pb-8 -mt-12">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center border-4 border-white">
                                <User className={`w-12 h-12 ${accentText[themeColor]}`} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-1">{profile?.fullName || 'Student Profile'}</h2>
                        <p className="text-slate-500 text-sm mb-8 uppercase tracking-widest font-bold">@{profile?.username}</p>

                        {message && (
                            <div className={`p-4 rounded-2xl mb-6 text-sm font-bold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <User className="w-3 h-3" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.fullName || ''}
                                        onChange={(e) => setProfile(p => p ? { ...p, fullName: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ring-offset-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        onChange={(e) => setProfile(p => p ? { ...p, email: e.target.value } : null)}
                                        placeholder="student@example.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ring-offset-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <Hash className="w-3 h-3" /> Student ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.studentId || ''}
                                        onChange={(e) => setProfile(p => p ? { ...p, studentId: e.target.value } : null)}
                                        placeholder="2024-XXXXX"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ring-offset-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Course
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.course || ''}
                                        onChange={(e) => setProfile(p => p ? { ...p, course: e.target.value } : null)}
                                        placeholder="BS Information Technology"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ring-offset-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <GraduationCap className="w-3 h-3" /> Year Level
                                    </label>
                                    <select
                                        value={profile?.yearLevel || ''}
                                        onChange={(e) => setProfile(p => p ? { ...p, yearLevel: e.target.value } : null)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ring-offset-2 appearance-none"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="Irregular">Irregular</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-8 py-3 ${themeClasses[themeColor]} text-white rounded-2xl font-bold shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95`}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSettings;
