import React from 'react';
import { ShieldCheck, BookOpen, FlaskConical, FileSpreadsheet, CheckCircle2, LogIn, ArrowRight, Activity } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function LandingPage({ onOpenLogin }) {
  const { manuals } = useWorkflow();

  return (
    <div className="min-h-screen bg-[#edf3f9] text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Government & NTB Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Bureau Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-black text-lg shadow-md border border-blue-900">
              NTB
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-xl font-black text-[#1e3a8a] tracking-tight uppercase">
                  National Testing Bureau
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase hidden sm:inline-block">
                  Govt. Accredited Lab
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 font-semibold tracking-wide">
                Central Laboratory Automation & Quality Certification Portal
              </p>
            </div>
          </div>

          {/* Navigation Links & Login CTA */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 mr-2">
              <a href="#features" className="hover:text-[#1e3a8a] transition-colors">Features</a>
              <a href="#scope" className="hover:text-[#1e3a8a] transition-colors">Accredited Scope</a>
              <a href="#manuals" className="hover:text-[#1e3a8a] transition-colors">SOP Manuals</a>
              <a href="#statistics" className="hover:text-[#1e3a8a] transition-colors">Portal Metrics</a>
            </nav>

            <button
              onClick={onOpenLogin}
              className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-4 md:px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer touch-manipulation"
            >
              <LogIn size={16} />
              <span>Login to Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-[#edf3f9] border-b border-slate-200 py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1e3a8a] border border-blue-200 text-xs font-bold shadow-2xs">
            <ShieldCheck size={16} className="text-[#f5b041]" />
            <span>BIS Recognized & Government Certified Testing Operations</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            National Laboratory Automation, Sample Inwarding & Certificate Portal
          </h1>

          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Standardizing testing workflows for Mechanical, Chemical, Electrical, Electronics, and Biological laboratories with real-time audit trails, multi-role allocation, and certified report generation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-blue-800 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Access Role Workstation</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="#manuals"
              className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-xl shadow-2xs text-xs md:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen size={16} className="text-blue-600" />
              <span>Browse 13 SOP Manuals</span>
            </a>
          </div>

        </div>
      </section>

      {/* PORTAL STATS COUNTER */}
      <section id="statistics" className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <div className="text-2xl md:text-4xl font-black text-[#1e3a8a]">4,250+</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Samples Processed</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl md:text-4xl font-black text-emerald-600">99.8%</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">On-Time Verification</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl md:text-4xl font-black text-amber-600">5</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accredited Testing Sections</div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl md:text-4xl font-black text-purple-600">13</div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Published SOP User Manuals</div>
          </div>

        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section id="features" className="py-16 px-4 md:px-6 max-w-7xl mx-auto space-y-12 w-full">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enterprise Workflow Capabilities</h2>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">Key Portal Modules & Role Workstations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-blue-50 text-[#1e3a8a] w-fit">
              <FlaskConical size={24} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Sample Inwarding & Allocation</h4>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Sample Cell inwards test samples with automated Encoded Codes (e.g. 25M3AFE89). Technical Managers allocate samples to accredited section engineers within 48 hours.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-blue-700 font-bold pt-2 border-t border-slate-100">
              <CheckCircle2 size={14} />
              <span>Supplementary & Amended Inwarding</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 w-fit">
              <Activity size={24} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Test Result Verification & Sign-Off</h4>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Technical Engineers log test findings (hydrostatic pressure, gas leakage, flame endurance). Technical Managers audit and verify test sheets before report compilation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pt-2 border-t border-slate-100">
              <CheckCircle2 size={14} />
              <span>Single-Click Approval & Return Workflow</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 w-fit">
              <FileSpreadsheet size={24} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">PR / NPR Section Reports</h4>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Compile priority (PR) and non-priority (NPR) test reports, OIC performance metrics, and testing person workload breakdown strictly compliant with PDF Page 10-15 specs.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-purple-700 font-bold pt-2 border-t border-slate-100">
              <CheckCircle2 size={14} />
              <span>Full LIMS & Export Compatibility</span>
            </div>
          </div>

        </div>
      </section>

      {/* ACCREDITED SCOPE SECTION */}
      <section id="scope" className="py-16 bg-white border-y border-slate-200 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">National Standards</h2>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">Accredited Testing Standards</h3>
            </div>
            <button
              onClick={onOpenLogin}
              className="bg-[#1e3a8a] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs self-start md:self-auto cursor-pointer"
            >
              Authenticate to View Full Database
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            {[
              { code: 'IS 4246 (2025)', title: 'Domestic Gas Stoves & LPG Regulators', dept: 'Mechanical' },
              { code: 'IS 2347 (2023)', title: 'Aluminium Pressure Cookers & Valves', dept: 'Mechanical' },
              { code: 'IS 3025 (2021)', title: 'Water Purity & Chemical Traces', dept: 'Chemical' },
              { code: 'IS 156 (2022)', title: 'Electrical Wiring & Insulation', dept: 'Electrical' }
            ].map((spec) => (
              <div key={spec.code} className="bg-[#edf3f9] border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                  {spec.code}
                </span>
                <div className="font-extrabold text-slate-900 text-sm">{spec.title}</div>
                <div className="text-slate-500 text-[10px]">Section: <strong>{spec.dept}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOP USER MANUALS SECTION */}
      <section id="manuals" className="py-16 px-4 md:px-6 max-w-7xl mx-auto space-y-8 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Standard Operating Procedures</h2>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">13 Official NTB User Manuals</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Page 10 & 15 PDF Compliant</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs divide-y divide-slate-100 text-xs">
          {manuals.slice(0, 5).map((m, idx) => (
            <div key={m.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 w-6">{idx + 1}.</span>
                <BookOpen size={16} className="text-blue-600 shrink-0" />
                <span className="font-bold text-slate-800">{m.title}</span>
              </div>
              <button
                onClick={onOpenLogin}
                className="bg-[#3b82f6] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 md:px-6 mt-auto border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-black text-white text-base">NATIONAL TESTING BUREAU (NTB)</div>
            <p className="text-slate-400 text-[11px]">Laboratory Management & Quality Assurance Automation System © 2026</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenLogin}
              className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 font-bold px-4 py-2 rounded-xl shadow-md text-xs transition-colors cursor-pointer"
            >
              Sign In to Workstation
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
