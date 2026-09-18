/**
 * Central Credential Registry for NTB Lab Portal Workstation Roles
 */

export const ROLE_CREDENTIALS = {
  'Technical Manager': {
    role: 'Technical Manager',
    id: 'TM-201',
    name: 'V. K. Jain',
    title: 'Head Technical Manager',
    email: 'vk.jain@ntb.gov.in',
    password: 'Manager@ntb2026',
    avatar: 'VJ',
    section: 'All Laboratories',
    color: 'border-blue-600 bg-blue-50 text-blue-900',
    badgeColor: 'bg-[#1e3a8a] text-white',
    desc: 'Sample allocation, test result verification, section supervision.'
  },
  'Technical Engineer': {
    role: 'Technical Engineer',
    id: 'ENG-101',
    name: 'Mariam Tyagi',
    title: 'Senior Mechanical Engineer',
    email: 'mariam@ntb.gov.in',
    password: 'Engineer@ntb2026',
    avatar: 'MT',
    section: 'Mechanical',
    color: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    badgeColor: 'bg-emerald-600 text-white',
    desc: 'Conduct physical & chemical testing, submit test findings.'
  },
  'Sample Cell': {
    role: 'Sample Cell',
    id: 'SC-101',
    name: 'Inward Officer',
    title: 'Sample Cell Executive',
    email: 'samplecell@ntb.gov.in',
    password: 'SampleCell@ntb2026',
    avatar: 'SC',
    section: 'Sample Cell Desk',
    color: 'border-amber-600 bg-amber-50 text-amber-900',
    badgeColor: 'bg-amber-600 text-white',
    desc: 'Sample receipt, metadata inwarding, report release.'
  },
  'Reporting Manager': {
    role: 'Reporting Manager',
    id: 'RM-301',
    name: 'S. P. Yadav',
    title: 'Quality Reporting Manager',
    email: 'sp.yadav@ntb.gov.in',
    password: 'ReportManager@ntb2026',
    avatar: 'SY',
    section: 'Quality Assurance',
    color: 'border-cyan-600 bg-cyan-50 text-cyan-900',
    badgeColor: 'bg-cyan-600 text-white',
    desc: 'Compile test certificates & final report release.'
  },
  'Admin': {
    role: 'Admin',
    id: 'ADM-001',
    name: 'System Admin',
    title: 'NTB Master Admin',
    email: 'admin@ntb.gov.in',
    password: 'Admin@ntb2026',
    avatar: 'AD',
    section: 'System Administration',
    color: 'border-rose-600 bg-rose-50 text-rose-900',
    badgeColor: 'bg-rose-600 text-white',
    desc: 'Master personnel management, LIMS integration, SOP publishing.'
  }
};

/**
 * Validate role credentials by Employee ID or Email
 */
export function validateRoleCredentials(role, identifier, password) {
  const target = ROLE_CREDENTIALS[role];
  if (!target) return { valid: false, message: `Unknown role: ${role}` };

  const inputId = (identifier || '').trim().toLowerCase();
  const inputPwd = (password || '').trim();

  const matchId = !inputId || inputId === target.id.toLowerCase() || inputId === target.email.toLowerCase();
  
  if (!matchId) {
    return { valid: false, message: `Invalid ID or Email for ${role}. Expected '${target.id}' or '${target.email}'.` };
  }

  if (inputPwd && inputPwd !== target.password) {
    return { valid: false, message: `Incorrect password for ${role}. Hint: '${target.password}'` };
  }

  return { valid: true, creds: target };
}
