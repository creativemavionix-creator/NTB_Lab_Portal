import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Settings, Users, LogIn, Lock, Mail, X, CheckCircle, ArrowRight } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export default function LoginModal({ isOpen, onClose }) {
  const { login, triggerNotification } = useWorkflow();
  const [selectedRole, setSelectedRole] = useState('Technical Manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const roleOptions = [
    {
      role: 'Technical Manager',
      name: 'V. K. Jain',
      title: 'Head Technical Manager',
      email: 'vk.jain@ntb.gov.in',
      avatar: 'VJ',
      color: 'border-blue-600 bg-blue-50 text-blue-900',
      badgeColor: 'bg-[#1e3a8a] text-white',
      icon: ShieldCheck,
      desc: 'Sample allocation, test result verification, section supervision.'
    },
    {
      role: 'Technical Engineer',
      name: 'Mariam Tyagi',
      title: 'Senior Mechanical Engineer',
      email: 'mariam@ntb.gov.in',
      avatar: 'MT',
      color: 'border-emerald-600 bg-emerald-50 text-emerald-900',
      badgeColor: 'bg-emerald-600 text-white',
      icon: Users,
      desc: 'Conduct physical & chemical testing, submit test findings.'
    },
    {
      role: 'Sample Cell',
      name: 'Inward Officer',
      title: 'Sample Cell Executive',
      email: 'samplecell@ntb.gov.in',
      avatar: 'SC',
      color: 'border-amber-600 bg-amber-50 text-amber-900',
      badgeColor: 'bg-amber-600 text-white',
      icon: UserCheck,
      desc: 'Sample receipt, metadata inwarding, report release.'
    },
    {
      role: 'Reporting Manager',
      name: 'S. P. Yadav',
      title: 'Quality Reporting Manager',
      email: 'sp.yadav@ntb.gov.in',
      avatar: 'SY',
      color: 'border-cyan-600 bg-cyan-50 text-cyan-900',
      badgeColor: 'bg-cyan-600 text-white',
      icon: Settings,
      desc: 'Compile test certificates & final report release.'
    },
    {
      role: 'Admin',
      name: 'System Admin',
      title: 'NTB Master Admin',
      email: 'admin@ntb.gov.in',
      avatar: 'AD',
      color: 'border-rose-600 bg-rose-50 text-rose-900',
      badgeColor: 'bg-rose-600 text-white',
      icon: Settings,
      desc: 'Master personnel management, LIMS integration, SOP publishing.'
    }
  ];

  const activeRoleData = roleOptions.find(r => r.role === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userEmail = email || activeRoleData.email;

    if (isSupabaseConfigured && password) {
      setIsLoading(true);
      const { user, error } = await authService.signIn(userEmail, password);
      setIsLoading(false);

      if (error) {
        // Fallback or attempt auto sign up for demo credentials
        console.warn('Supabase auth failed, falling back to local workflow login:', error);
        triggerNotification(`Supabase auth note: ${error}. Logged in locally.`, 'warning');
      } else {
        triggerNotification(`Authenticated with Supabase as ${user.email}`, 'success');
      }
    }

    login(selectedRole, {
      name: activeRoleData.name,
      email: userEmail,
      avatar: activeRoleData.avatar
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#1e3a8a] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 text-[#f5b041] shrink-0">
              <LogIn size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight">
                NTB Portal Multi-Role Login
              </h2>
              <p className="text-blue-100 text-[10px] sm:text-xs font-medium">
                Select your accredited workstation role to authenticate
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
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-3.5 sm:space-y-6 text-xs text-slate-800 scrollbar-thin">
          
          {/* Role Cards Selection */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">
              Select Workstation Persona / Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {roleOptions.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(item.role);
                      setEmail(item.email);
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer touch-manipulation min-h-[72px] ${
                      isSelected 
                        ? `${item.color} shadow-sm ring-2 ring-indigo-500/40 font-bold`
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${item.badgeColor}`}>
                        {item.role}
                      </span>
                      {isSelected && <CheckCircle size={13} className="text-indigo-600 shrink-0" />}
                    </div>

                    <div>
                      <div className="font-extrabold text-[11px] sm:text-xs text-slate-900 truncate">{item.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">{item.title}</div>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[8px] sm:text-[9px] font-semibold text-slate-500">
                      <span>Select</span>
                      <ArrowRight size={10} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 border-t border-slate-200 pt-3 sm:pt-4">
            <div className="font-bold text-slate-900 text-xs">Official Account Credentials</div>
            
            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Official Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email || activeRoleData.email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@ntb.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[40px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[40px]"
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
                  <span>Authenticate & Open Workstation</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
