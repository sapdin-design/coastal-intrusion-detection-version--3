import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radio, Lock, Mail, Shield, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('operator@cidrtm.gov.in');
  const [password, setPassword] = useState<string>('Operator@1234');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or connection error');
    }
  };

  const handleQuick = async (role: 'admin' | 'operator') => {
    setError('');
    try {
      await quickLoginAs(role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-4 tactical-grid">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] mb-2">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100 font-mono">
            CIDRTM
          </h1>
          <p className="text-xs text-cyan-400/90 font-mono font-bold tracking-widest uppercase">
            Coastal Intrusion Detection & Real-Time Monitoring
          </p>
          <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-bold tracking-widest font-mono">
            SIMULATION MODE • KANYAKUMARI SECTOR
          </div>
        </div>

        {/* Login Card */}
        <div className="p-6 rounded-2xl bg-[#09111e]/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Officer Email / ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Access Token / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-950/60 font-sans"
            >
              <span>Authenticate & Enter Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block text-center">
              Quick Academic Demo Access (1-Click)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuick('operator')}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold font-mono">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Operator</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Sasi</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('admin')}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-bold font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">Sapdin</p>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          CIDRTM Prototype • Academic Demonstration Only • Offshore Kanyakumari Sector
        </p>
      </div>
    </div>
  );
};
