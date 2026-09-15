-- =====================================================================
-- NATIONAL TESTING BUREAU (NTB) LAB PORTAL - RELATIONAL SEED DATA
-- Enterprise Database Seed Script for 12 Interlinked Tables
-- =====================================================================

-- 1. LABORATORIES
INSERT INTO laboratories (id, code, name, location) VALUES
('LAB-001', 'NTB-GZB', 'National Testing Bureau Central Facility', 'Ghaziabad Central Campus'),
('LAB-002', 'NTB-DEL', 'NTB Regional Material Testing Lab', 'Okhla Industrial Area, New Delhi'),
('LAB-003', 'NTB-MUM', 'NTB Polymer & Chemical Research Center', 'Thane West, Mumbai')
ON CONFLICT (id) DO NOTHING;

-- 2. SECTIONS
INSERT INTO sections (id, lab_id, code, name, head_name) VALUES
('SEC-MECH', 'LAB-001', 'MECH', 'Mechanical Testing Lab', 'Dr. Ramesh Verma'),
('SEC-ELEC', 'LAB-001', 'ELEC', 'Electrical & Electronics Lab', 'Er. Sunita Sharma'),
('SEC-CHEM', 'LAB-001', 'CHEM', 'Chemical Analysis Lab', 'Dr. Amit Patel'),
('SEC-MET',  'LAB-001', 'MET',  'Metallurgy & Hardness Lab', 'Er. Vikas Singh')
ON CONFLICT (id) DO NOTHING;

-- 3. PERSONNEL
INSERT INTO personnel (id, personnel_code, name, email, role, section_id, section_name, active_tasks_count) VALUES
('PER-SC-01',  'EMP-SC01', 'Rajesh Kumar',     'rajesh.sc@ntb.gov.in', 'Sample Cell',         'SEC-MECH', 'Mechanical Testing Lab', 12),
('PER-TM-01',  'EMP-TM01', 'Dr. Ramesh Verma', 'ramesh.tm@ntb.gov.in', 'Technical Manager',   'SEC-MECH', 'Mechanical Testing Lab', 8),
('PER-TE-01',  'EMP-TE01', 'Vikram Singh',     'vikram.te@ntb.gov.in', 'Technical Engineer',  'SEC-MECH', 'Mechanical Testing Lab', 5),
('PER-TE-02',  'EMP-TE02', 'Priya Sharma',     'priya.te@ntb.gov.in',  'Technical Engineer',  'SEC-ELEC', 'Electrical & Electronics Lab', 3),
('PER-RM-01',  'EMP-RM01', 'Sanjay Dutt',      'sanjay.rm@ntb.gov.in', 'Reporting Manager',  'SEC-CHEM', 'Chemical Analysis Lab', 4),
('PER-ADM-01', 'EMP-AD01', 'System Admin',     'admin@ntb.gov.in',     'Admin',              'SEC-MECH', 'Mechanical Testing Lab', 0)
ON CONFLICT (id) DO NOTHING;

-- 4. MASTER_DATA
INSERT INTO master_data (category, item_value, description) VALUES
('laboratories', 'Mechanical Testing Lab', 'High capacity tensile, impact, and structural testing'),
('laboratories', 'Electrical & Electronics Lab', 'Dielectric, resistance, and high voltage safety testing'),
('laboratories', 'Chemical Analysis Lab', 'Spectrometry, composition analysis, and corrosion testing'),
('laboratories', 'Metallurgy & Hardness Lab', 'Microstructure, Rockwell/Vickers hardness testing'),
('sampleTypes', 'Raw Metal Alloy', 'Unprocessed raw metal ingots and plates'),
('sampleTypes', 'High-Density Polymer', 'Engineering thermoplastics and composite sheets'),
('sampleTypes', 'Structural Steel Beam', 'Load-bearing I-beams and reinforcing bars'),
('sampleTypes', 'Insulated Copper Wire', 'Electrical distribution cables'),
('standards', 'ISO 9001:2015', 'Quality Management System Standard'),
('standards', 'ASTM E8 / E8M', 'Standard Test Methods for Tension Testing of Metallic Materials'),
('standards', 'IS 2062:2011', 'Hot Rolled Medium and High Tensile Structural Steel'),
('standards', 'IEC 60227', 'Polyvinyl Chloride Insulated Cables'),
('testTypes', 'Tensile Strength Test', 'Ultimate tensile strength and elongation percentage'),
('testTypes', 'Chemical Spectrometry', 'Elemental composition percentage breakdown'),
('testTypes', 'High Voltage Breakdown', 'Dielectric breakdown voltage threshold test'),
('testTypes', 'Hardness Test', 'Rockwell B & C Scale Hardness measurement')
ON CONFLICT (category, item_value) DO NOTHING;

-- 5. SAMPLES
INSERT INTO samples (
    id, product, applicant, sample_type, date_received, forwarded_on, quantity, standard, required_tests,
    priority, testing_section, testing_section_id, test_type, assigned_engineer, assigned_engineer_id,
    test_request_id, status, type, condition, storage_location
) VALUES
(
    'SMP-2026-001', 'Steel Structural Beam X-500', 'Apex Engineering Ltd', 'Structural Steel Beam',
    '2026-09-10', '2026-09-11', '2.000 Pcs', 'IS 2062:2011', 'Tensile Strength, Yield Stress, Elongation',
    'High', 'Mechanical Testing Lab', 'SEC-MECH', 'Tensile Strength Test', 'Vikram Singh', 'PER-TE-01',
    'TR-2026-001', 'Forwarded to Tech Manager', 'New', 'Intact', 'Rack A-101'
),
(
    'SMP-2026-002', 'Copper Electrical Cable 4mm', 'Orient Electricals', 'Insulated Copper Wire',
    '2026-09-12', '2026-09-12', '50.00 Meters', 'IEC 60227', 'High Voltage Breakdown, Resistance',
    'Normal', 'Electrical & Electronics Lab', 'SEC-ELEC', 'High Voltage Breakdown', 'Priya Sharma', 'PER-TE-02',
    'TR-2026-002', 'Under Technical Testing', 'New', 'Intact', 'Rack B-204'
),
(
    'SMP-2026-003', 'Polymer Composite Plate', 'Polytech Plastics', 'High-Density Polymer',
    '2026-09-13', '2026-09-14', '5.000 Pcs', 'ISO 9001:2015', 'Flexural Modulus, Impact Strength',
    'Low', 'Chemical Analysis Lab', 'SEC-CHEM', 'Chemical Spectrometry', NULL, NULL,
    'TR-2026-003', 'Pending Allocation', 'New', 'Intact', 'Rack C-302'
),
(
    'SMP-2026-004', 'Aluminum Alloy Ingot Grade-A', 'Hindalco Industries', 'Raw Metal Alloy',
    '2026-09-14', '2026-09-14', '1.000 Pcs', 'ASTM E8 / E8M', 'Hardness Test, Spectrometry',
    'Urgent', 'Metallurgy & Hardness Lab', 'SEC-MET', 'Hardness Test', 'Vikram Singh', 'PER-TE-01',
    'TR-2026-004', 'Report Generation Pending', 'New', 'Intact', 'Rack A-105'
)
ON CONFLICT (id) DO NOTHING;

-- 6. TEST_REQUESTS
INSERT INTO test_requests (id, sample_id, product, sample_type, standard, test_type, testing_section, priority, required_date, status) VALUES
('TR-2026-001', 'SMP-2026-001', 'Steel Structural Beam X-500', 'Structural Steel Beam', 'IS 2062:2011', 'Tensile Strength Test', 'Mechanical Testing Lab', 'High', '2026-09-20', 'GENERATED'),
('TR-2026-002', 'SMP-2026-002', 'Copper Electrical Cable 4mm', 'Insulated Copper Wire', 'IEC 60227', 'High Voltage Breakdown', 'Electrical & Electronics Lab', 'Medium', '2026-09-22', 'IN_PROGRESS'),
('TR-2026-003', 'SMP-2026-003', 'Polymer Composite Plate', 'High-Density Polymer', 'ISO 9001:2015', 'Chemical Spectrometry', 'Chemical Analysis Lab', 'Low', '2026-09-25', 'PENDING_ALLOCATION'),
('TR-2026-004', 'SMP-2026-004', 'Aluminum Alloy Ingot Grade-A', 'Raw Metal Alloy', 'ASTM E8 / E8M', 'Hardness Test', 'Metallurgy & Hardness Lab', 'Urgent', '2026-09-18', 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

-- 7. TEST_REPORTS
INSERT INTO test_reports (id, sample_id, report_number, issue_date, reporting_manager, reporting_manager_id, testing_section, test_results_summary, status) VALUES
('REP-2026-001', 'SMP-2026-004', 'NTB/REP/2026/001', '2026-09-15', 'Sanjay Dutt', 'PER-RM-01', 'Metallurgy & Hardness Lab', 'Hardness measured at 85 HRB. Chemical breakdown verified within tolerance specifications.', 'ISSUED')
ON CONFLICT (id) DO NOTHING;

-- 8. SERIES_TRACKERS
INSERT INTO series_trackers (id, product, applicant, request_date, sample_count, completed_reports, pending_reports, status) VALUES
('SERIES-2026-01', 'Steel Structural Beam Series X', 'Apex Engineering Ltd', '2026-09-10', 5, 2, 3, 'In Progress'),
('SERIES-2026-02', 'Copper Cable 4mm Batch B', 'Orient Electricals', '2026-09-12', 3, 1, 2, 'In Progress')
ON CONFLICT (id) DO NOTHING;

-- 9. CLARIFICATION_QUERIES
INSERT INTO clarification_queries (id, sample_id, subject, clarification, received_from, assigned_engineer, raised_by, raised_by_id, sent_to, status) VALUES
('CQ-2026-001', 'SMP-2026-003', 'Missing Test Temperature Spec', 'Applicant needs to specify test ambient temp requirement for flexural modulus test.', 'Technical Manager', 'Vikram Singh', 'Dr. Ramesh Verma', 'PER-TM-01', 'Sample Cell', 'Open')
ON CONFLICT (id) DO NOTHING;

-- 10. SAMPLE_REQUESTS
INSERT INTO sample_requests (id, sample_id, product, type, request_date, reason, status, requested_by) VALUES
('REQ-2026-001', 'SMP-2026-001', 'Steel Structural Beam X-500', 'RETURN', '2026-09-14', 'Applicant requested return of un-tested second specimen beam after testing completes.', 'PENDING', 'Apex Engineering Ltd')
ON CONFLICT (id) DO NOTHING;

-- 11. USER_MANUALS
INSERT INTO user_manuals (title, updated_by, date, published, file_url) VALUES
('NTB Sample Registration & Barcoding SOP v2.4', 'Admin', '2026-09-01', TRUE, '/documents/sop-sample-registration.pdf'),
('Technical Testing Allocation & Engineer Verification Workflow', 'Dr. Ramesh Verma', '2026-09-05', TRUE, '/documents/sop-testing-allocation.pdf'),
('Reporting Manager Quality Verification & Digital Sign-off Manual', 'Sanjay Dutt', '2026-09-08', TRUE, '/documents/sop-reporting-signoff.pdf')
ON CONFLICT DO NOTHING;

-- 12. AUDIT_LOGS
INSERT INTO audit_logs (time, text, entity_type, entity_id, performed_by) VALUES
('2026-09-10 09:30:00', 'Sample SMP-2026-001 registered by Sample Cell', 'sample', 'SMP-2026-001', 'Rajesh Kumar'),
('2026-09-11 11:15:00', 'Sample SMP-2026-001 forwarded to Technical Manager (SEC-MECH)', 'sample', 'SMP-2026-001', 'Rajesh Kumar'),
('2026-09-12 14:00:00', 'Sample SMP-2026-002 assigned to Technical Engineer Priya Sharma', 'sample', 'SMP-2026-002', 'Dr. Ramesh Verma'),
('2026-09-15 10:45:00', 'Test Report NTB/REP/2026/001 generated and issued for SMP-2026-004', 'report', 'REP-2026-001', 'Sanjay Dutt');
