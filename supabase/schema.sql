-- =====================================================================
-- NATIONAL TESTING BUREAU (NTB) LAB PORTAL - MULTI-TABLE DATABASE SCHEMA
-- Enterprise Relational Database Migration Script for Supabase / PostgreSQL
-- Optimized for Large Datasets with Indexes, Foreign Keys & Triggers
-- =====================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order if migrating
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_manuals CASCADE;
DROP TABLE IF EXISTS sample_requests CASCADE;
DROP TABLE IF EXISTS clarification_queries CASCADE;
DROP TABLE IF EXISTS series_trackers CASCADE;
DROP TABLE IF EXISTS test_reports CASCADE;
DROP TABLE IF EXISTS test_requests CASCADE;
DROP TABLE IF EXISTS samples CASCADE;
DROP TABLE IF EXISTS master_data CASCADE;
DROP TABLE IF EXISTS personnel CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;

-- ---------------------------------------------------------------------
-- 1. LABORATORIES TABLE (Master Facility Database)
-- ---------------------------------------------------------------------
CREATE TABLE laboratories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) DEFAULT 'Ghaziabad Central Campus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. SECTIONS TABLE (Testing Laboratories Sub-Sections)
-- ---------------------------------------------------------------------
CREATE TABLE sections (
    id VARCHAR(50) PRIMARY KEY,
    lab_id VARCHAR(50) REFERENCES laboratories(id) ON DELETE SET NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    head_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. PERSONNEL TABLE (Staff & Persona Role Accounts)
-- ---------------------------------------------------------------------
CREATE TABLE personnel (
    id VARCHAR(50) PRIMARY KEY,
    personnel_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'Technical Manager', 'Technical Engineer', 'Sample Cell', 'Reporting Manager', 'Admin'
    section_id VARCHAR(50) REFERENCES sections(id) ON DELETE SET NULL,
    section_name VARCHAR(100),
    active_tasks_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. MASTER_DATA TABLE (Central Dynamic Categories Registry)
-- ---------------------------------------------------------------------
CREATE TABLE master_data (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'laboratories', 'sampleTypes', 'standards', 'testTypes', 'testParameters'
    item_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_item UNIQUE (category, item_value)
);

-- ---------------------------------------------------------------------
-- 5. SAMPLES TABLE (Core Sample Batch Registry)
-- ---------------------------------------------------------------------
CREATE TABLE samples (
    id VARCHAR(100) PRIMARY KEY,
    product VARCHAR(255) NOT NULL,
    applicant VARCHAR(255) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    date_received DATE DEFAULT CURRENT_DATE,
    forwarded_on DATE,
    quantity VARCHAR(50) DEFAULT '1.000 Pcs',
    standard VARCHAR(100) NOT NULL,
    required_tests TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    remarks TEXT,
    priority VARCHAR(25) DEFAULT 'Normal',
    testing_section VARCHAR(100) DEFAULT 'Mechanical',
    testing_section_id VARCHAR(50) REFERENCES sections(id) ON DELETE SET NULL,
    test_type VARCHAR(100) DEFAULT 'All',
    assigned_engineer VARCHAR(255),
    assigned_engineer_id VARCHAR(50) REFERENCES personnel(id) ON DELETE SET NULL,
    test_request_id VARCHAR(100),
    allocation_date DATE,
    due_date DATE,
    test_results TEXT,
    test_date DATE,
    result_status VARCHAR(50) DEFAULT 'Pending',
    verification_status VARCHAR(50) DEFAULT 'Pending Verification',
    report_number VARCHAR(100),
    report_date DATE,
    reporting_manager VARCHAR(255),
    reporting_manager_id VARCHAR(50) REFERENCES personnel(id) ON DELETE SET NULL,
    status VARCHAR(100) DEFAULT 'New Sample Received',
    type VARCHAR(50) DEFAULT 'New',
    condition VARCHAR(50) DEFAULT 'Intact',
    storage_location VARCHAR(100) DEFAULT 'Rack A-101',
    is_disputed BOOLEAN DEFAULT FALSE,
    dispute_status VARCHAR(50),
    dispute_reason TEXT,
    dispute_date DATE,
    return_reason TEXT,
    discard_reason TEXT,
    withdrawal_reason TEXT,
    withdrawal_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. TEST_REQUESTS TABLE (Formal Internal TR Entries)
-- ---------------------------------------------------------------------
CREATE TABLE test_requests (
    id VARCHAR(100) PRIMARY KEY,
    sample_id VARCHAR(100) REFERENCES samples(id) ON DELETE CASCADE,
    product VARCHAR(255) NOT NULL,
    sample_type VARCHAR(100),
    standard VARCHAR(100),
    test_type VARCHAR(100),
    testing_section VARCHAR(100),
    test_parameters JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(25) DEFAULT 'Medium',
    required_date DATE,
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'GENERATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 7. TEST_REPORTS TABLE (Issued & Verified Certificates)
-- ---------------------------------------------------------------------
CREATE TABLE test_reports (
    id VARCHAR(100) PRIMARY KEY,
    sample_id VARCHAR(100) REFERENCES samples(id) ON DELETE CASCADE,
    report_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    reporting_manager VARCHAR(255),
    reporting_manager_id VARCHAR(50) REFERENCES personnel(id) ON DELETE SET NULL,
    testing_section VARCHAR(100),
    test_results_summary TEXT,
    final_pdf_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ISSUED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 8. SERIES_TRACKERS TABLE (Product Group Series Trackers)
-- ---------------------------------------------------------------------
CREATE TABLE series_trackers (
    id VARCHAR(100) PRIMARY KEY,
    product VARCHAR(255) NOT NULL,
    applicant VARCHAR(255) NOT NULL,
    request_date DATE DEFAULT CURRENT_DATE,
    sample_count INT DEFAULT 1,
    completed_reports INT DEFAULT 0,
    pending_reports INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending Requests',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 9. CLARIFICATION_QUERIES TABLE (Technical Query Threads)
-- ---------------------------------------------------------------------
CREATE TABLE clarification_queries (
    id VARCHAR(100) PRIMARY KEY,
    sample_id VARCHAR(100) REFERENCES samples(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    clarification TEXT NOT NULL,
    received_from VARCHAR(255),
    date_received DATE DEFAULT CURRENT_DATE,
    assigned_engineer VARCHAR(255),
    raised_by VARCHAR(255),
    raised_by_id VARCHAR(50) REFERENCES personnel(id) ON DELETE SET NULL,
    date_raised DATE DEFAULT CURRENT_DATE,
    sent_to VARCHAR(100) DEFAULT 'Sample Cell',
    status VARCHAR(50) DEFAULT 'Open',
    response TEXT,
    response_date DATE,
    sample_status VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 10. SAMPLE_REQUESTS TABLE (Return & Discard Remnant Requests)
-- ---------------------------------------------------------------------
CREATE TABLE sample_requests (
    id VARCHAR(100) PRIMARY KEY,
    sample_id VARCHAR(100) REFERENCES samples(id) ON DELETE CASCADE,
    product VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'RETURN' or 'DISCARD'
    request_date DATE DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    requested_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 11. USER_MANUALS TABLE (Standard Operating Procedures)
-- ---------------------------------------------------------------------
CREATE TABLE user_manuals (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    updated_by VARCHAR(100) DEFAULT 'Admin',
    date DATE DEFAULT CURRENT_DATE,
    published BOOLEAN DEFAULT TRUE,
    file_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 12. AUDIT_LOGS TABLE (System Activity Audit Trail)
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    time VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    performed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES FOR SUB-MILLISECOND QUERY PERFORMANCE ON LARGE DATASETS
-- =====================================================================
CREATE INDEX idx_samples_status ON samples(status);
CREATE INDEX idx_samples_testing_section ON samples(testing_section);
CREATE INDEX idx_samples_assigned_engineer ON samples(assigned_engineer);
CREATE INDEX idx_samples_date_received ON samples(date_received);
CREATE INDEX idx_samples_priority ON samples(priority);
CREATE INDEX idx_test_requests_sample_id ON test_requests(sample_id);
CREATE INDEX idx_test_reports_sample_id ON test_reports(sample_id);
CREATE INDEX idx_test_reports_report_number ON test_reports(report_number);
CREATE INDEX idx_clarification_queries_sample_id ON clarification_queries(sample_id);
CREATE INDEX idx_clarification_queries_status ON clarification_queries(status);
CREATE INDEX idx_sample_requests_sample_id ON sample_requests(sample_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================================
-- AUTO-UPDATE TRIGGER FUNCTION FOR UPDATED_AT TIMESTAMP
-- =====================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_samples_timestamp
BEFORE UPDATE ON samples
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SECURE ENTERPRISE ACCESS
-- =====================================================================
ALTER TABLE laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clarification_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write access for portal operation
CREATE POLICY "Allow anon read all laboratories" ON laboratories FOR SELECT USING (true);
CREATE POLICY "Allow anon read all sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Allow anon read all personnel" ON personnel FOR SELECT USING (true);
CREATE POLICY "Allow anon all master_data" ON master_data FOR ALL USING (true);
CREATE POLICY "Allow anon all samples" ON samples FOR ALL USING (true);
CREATE POLICY "Allow anon all test_requests" ON test_requests FOR ALL USING (true);
CREATE POLICY "Allow anon all test_reports" ON test_reports FOR ALL USING (true);
CREATE POLICY "Allow anon all series_trackers" ON series_trackers FOR ALL USING (true);
CREATE POLICY "Allow anon all clarification_queries" ON clarification_queries FOR ALL USING (true);
CREATE POLICY "Allow anon all sample_requests" ON sample_requests FOR ALL USING (true);
CREATE POLICY "Allow anon all user_manuals" ON user_manuals FOR ALL USING (true);
CREATE POLICY "Allow anon all audit_logs" ON audit_logs FOR ALL USING (true);
