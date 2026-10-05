import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { ModelMetricsPage } from './pages/ModelMetricsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { api } from './api/client';
import { User } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('scamshield_token');
    if (token) {
      api.getMe()
        .then(res => setCurrentUser(res.user))
        .catch(() => {
          localStorage.removeItem('scamshield_token');
          setCurrentUser(null);
        });
    }
  }, []);

  const handleDemoLogin = async () => {
    try {
      const res = await api.demoLogin();
      localStorage.setItem('scamshield_token', res.access_token);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Demo login error', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scamshield_token');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onDemoLogin={handleDemoLogin}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onAnalyzeNow={() => setCurrentTab('analyze')}
            onSelectTab={(tab) => setCurrentTab(tab)}
          />
        )}
        {currentTab === 'dashboard' && (
          <DashboardPage onNavigateAnalyze={() => setCurrentTab('analyze')} />
        )}
        {currentTab === 'analyze' && <AnalyzePage />}
        {currentTab === 'history' && <HistoryPage />}
        {currentTab === 'threats' && <ThreatIntelPage />}
        {currentTab === 'metrics' && <ModelMetricsPage />}
        {currentTab === 'privacy' && <PrivacyPage />}
      </main>

      {/* Persistent Advisory Footer */}
      <Footer />
    </div>
  );
}

export default App;
