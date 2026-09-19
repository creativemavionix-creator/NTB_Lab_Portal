import React, { useState } from 'react';
import { LogIn, Lock, Mail, X } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { authenticateUserCredentials } from '../../config/roleCredentials';

export default function LoginModal({ isOpen, onClose }) {
  const { login, triggerNotification } = useWorkflow();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const authResult = authenticateUserCredentials(identifier, password);
    if (!authResult.valid) {
      triggerNotification(authResult.message, 'error');
      return;
    }

    const creds = authResult.creds;

    if (isSupabaseConfigured && password) {
      setIsLoading(true);
      const { user, error } = await authService.signIn(creds.email, password);
      setIsLoading(false);

      if (error) {
        console.warn('Supabase auth failed, falling back to local workflow login:', error);
        triggerNotification(`Supabase auth note: ${error}. Logged in locally.`, 'warning');
      } else {
        triggerNotification(`Authenticated with Supabase as ${user.email}`, 'success');
      }
    }

    await login(creds.role, {
      id: creds.id,
      name: creds.name,
      email: creds.email,
      avatar: creds.avatar
    });
    triggerNotification(`Authenticated as ${creds.role} (${creds.name})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1e3a8a] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 text-[#f5b041] shrink-0">
              <LogIn size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight">
                NTB Portal Workstation Login
              </h2>
              <p className="text-blue-100 text-[10px] sm:text-xs font-medium">
                Enter your Employee ID or Email and Password to sign in
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="Close login dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-800 scrollbar-thin">
          
          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Employee ID or Official Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. TM-201, ENG-101, SC-101, RM-301, ADM-001"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[42px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[42px]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e3a8a] hover:bg-blue-800 disabled:bg-blue-900/60 text-white font-black py-3 rounded-xl shadow-md text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer touch-manipulation min-h-[44px] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In & Open Workstation</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
