import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  themeColor?: 'blue' | 'emerald' | 'violet';
  fullScreen?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, themeColor = 'blue', fullScreen = false }) => {
  const themes = {
    blue: {
      blob1: 'bg-blue-300',
      blob2: 'bg-violet-300',
      blob3: 'bg-indigo-300',
      selection: 'selection:bg-blue-200'
    },
    emerald: {
      blob1: 'bg-emerald-300',
      blob2: 'bg-teal-300',
      blob3: 'bg-green-300',
      selection: 'selection:bg-emerald-200'
    },
    violet: {
      blob1: 'bg-violet-300',
      blob2: 'bg-fuchsia-300',
      blob3: 'bg-purple-300',
      selection: 'selection:bg-violet-200'
    }
  };

  const theme = themes[themeColor];

  return (
    <div className={`relative min-h-screen w-full ${fullScreen ? 'h-screen overflow-hidden' : 'overflow-y-auto overflow-x-hidden'} bg-slate-50 ${theme.selection}`}>
      {/* Ambient Background Lights */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute top-0 -left-4 w-96 h-96 ${theme.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob`}></div>
        <div className={`absolute top-0 -right-4 w-96 h-96 ${theme.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000`}></div>
        <div className={`absolute -bottom-32 left-20 w-96 h-96 ${theme.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000`}></div>
      </div>

      {/* Main Content Layer */}
      <div className={`relative z-10 ${fullScreen ? 'h-full' : 'min-h-screen'} flex flex-col`}>
        {children}
      </div>
    </div>
  );
};