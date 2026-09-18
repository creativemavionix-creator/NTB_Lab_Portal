import React, { useState } from 'react';
import { FlaskConical, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { ROLE_CREDENTIALS, validateRoleCredentials } from '../../config/roleCredentials';

export default function SplitLoginView({ onClose }) {
  const { login, triggerNotification } = useWorkflow();
  const [role, setRole] = useState('Sample Cell');
  const [employeeId, setEmployeeId] = useState(ROLE_CREDENTIALS['Sample Cell'].id);
  const [password, setPassword] = useState(ROLE_CREDENTIALS['Sample Cell'].password);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    const creds = ROLE_CREDENTIALS[newRole];
    if (creds) {
      setEmployeeId(creds.id);
      setPassword(creds.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateRoleCredentials(role, employeeId, password);
    if (!validation.valid) {
      triggerNotification(validation.message, 'error');
      return;
    }

    const creds = validation.creds;
    try {
      setIsSubmitting(true);
      await login(role, { id: creds.id, name: creds.name, email: creds.email, avatar: creds.avatar });
      triggerNotification(`Authenticated as ${role} workstation persona (${creds.name})`, 'success');
      if (onClose) onClose();
    } catch (err) {
      triggerNotification(`Login failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/80 backdrop-blur-sm font-sans overflow-y-auto animate-fade-in">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] overflow-y-auto border border-slate-700">
        
        {/* LEFT PANEL: Branding & Visual Graphic */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#1e3a8a] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 rounded-xl text-slate-950 shadow-md">
                <FlaskConical size={28} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wide text-white uppercase">National Testing Bureau</h1>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Sample Cell Portal</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight text-slate-100">
                Welcome to National Testing Bureau - Sample Cell Management Portal
              </h2>
              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                Centralized inward sample ingestion, Test Request generation, master data sync, and automated return report verification loop.
              </p>
            </div>

            <div className="space-y-2.5 pt-4 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#f59e0b]" />
                <span>Admin Master Data Connection & End-to-End Tracing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#f59e0b]" />
                <span>Real-Time Forwarding to Technical Managers & Engineers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#f59e0b]" />
                <span>Automated Final Report & PDF Ingestion Sync</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>© 2026 National Testing Bureau</span>
            <span className="font-bold text-amber-400">BIS LIMS Compliant</span>
          </div>
        </div>

        {/* RIGHT PANEL: Sign In Form */}
        <div className="p-8 md:p-12 bg-white flex flex-col justify-between text-slate-800">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-[#1e293b]">Welcome Back</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Sign in to access the NTB Sample Cell Portal workstation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#f59e0b] focus:outline-none"
                  placeholder="Enter Employee ID (e.g. NTB-SC-101)"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#f59e0b] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Workstation Role
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 focus:outline-none cursor-pointer"
                >
                  <option value="Sample Cell">Sample Cell Officer</option>
                  <option value="Technical Manager">Technical Manager</option>
                  <option value="Technical Engineer">Technical Engineer</option>
                  <option value="Reporting Manager">Reporting Manager</option>
                  <option value="Admin">System Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => triggerNotification('Please contact NTB System Administrator at ntb-admin@ntb.gov.in for password reset.', 'info')}
                  className="text-indigo-700 hover:underline font-bold focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#e09b2d] disabled:bg-amber-300 text-slate-950 font-black text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-slate-400 font-medium">
            Need workstation access support? Contact <span className="text-slate-700 font-bold">ntb-admin@ntb.gov.in</span>
          </div>
        </div>

      </div>
    </div>
  );
}
