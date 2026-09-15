import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { samplesService } from '../services/samplesService';
import { clarificationsService } from '../services/clarificationsService';
import { manualsService } from '../services/manualsService';
import { logsService } from '../services/logsService';

const WorkflowContext = createContext();

// ==========================================
// MOCK DATA STRICTLY COMPLIANT WITH PDF SPECS
// ==========================================
const INITIAL_ENGINEERS = [
  { id: 'eng-1', name: 'Mariam Tyagi', email: 'mariam@ntb.gov.in', section: 'Mechanical', activeTasks: 3 },
  { id: 'eng-2', name: 'Harendra Singh', email: 'harendra@ntb.gov.in', section: 'Mechanical', activeTasks: 2 },
  { id: 'eng-3', name: 'Rajesh Kumar', email: 'rajesh@ntb.gov.in', section: 'Chemical', activeTasks: 1 },
  { id: 'eng-4', name: 'Sunita Sharma', email: 'sunita@ntb.gov.in', section: 'Electrical', activeTasks: 0 },
  { id: 'eng-5', name: 'Dr. Vikram Patel', email: 'vikram.p@ntb.gov.in', section: 'Electronics', activeTasks: 2 },
  { id: 'eng-6', name: 'Ananya Deshmukh', email: 'ananya.d@ntb.gov.in', section: 'Biological', activeTasks: 1 }
];

const INITIAL_OICS = [
  { id: 'oic-1', name: 'Dr. A. K. Gupta', section: 'Mechanical' },
  { id: 'oic-2', name: 'Dr. R. S. Verma', section: 'Chemical' },
  { id: 'oic-3', name: 'Dr. S. K. Roy', section: 'Electrical' },
];

const INITIAL_REPORTING_MANAGERS = [
  { id: 'rm-1', name: 'S. P. Yadav', email: 'sp.yadav@ntb.gov.in' },
  { id: 'rm-2', name: 'Neha Chaudhry', email: 'neha.c@ntb.gov.in' },
];

const INITIAL_SECTIONS = ['Mechanical', 'Chemical', 'Electrical', 'Electronics', 'Biological'];

// 13 Manuals strictly listed on Page 10 & 15 of PDF
const INITIAL_MANUALS = [
  { id: 1, title: 'Lab Recognition Scheme Registration Process', updatedBy: 'Admin', date: '2026-01-10', published: true },
  { id: 2, title: 'Sample Handling - Accept & Forwarding Samples Process', updatedBy: 'Admin', date: '2026-01-15', published: true },
  { id: 3, title: 'Sample Handling - Modifying Forwarded Samples', updatedBy: 'Admin', date: '2026-01-20', published: true },
  { id: 4, title: 'Sample Handling - Amendment of Issued/Approved Test Reports', updatedBy: 'Admin', date: '2026-02-01', published: true },
  { id: 5, title: 'Lab Audit Mobile App - Auditor Manual', updatedBy: 'Admin', date: '2026-02-05', published: true },
  { id: 6, title: 'QA Module - User Manual', updatedBy: 'Admin', date: '2026-02-08', published: true },
  { id: 7, title: 'Store Management (BIS Lab) User Manual', updatedBy: 'Admin', date: '2026-02-12', published: true },
  { id: 8, title: 'Remnant Store User Manual', updatedBy: 'Admin', date: '2026-02-14', published: true },
  { id: 9, title: 'Equipment Module User Manual', updatedBy: 'Admin', date: '2026-02-16', published: true },
  { id: 10, title: 'LIMS - New & Renewal Application including ROP User Manual', updatedBy: 'Admin', date: '2026-02-18', published: true },
  { id: 11, title: 'User manual for the filling of renewal application in LIMS portal', updatedBy: 'Admin', date: '2026-02-20', published: true },
  { id: 12, title: 'SOP for clearing pending samples', updatedBy: 'Admin', date: '2026-02-22', published: true },
  { id: 13, title: 'USER MANUAL FOR UPLOADING OF REPORT FOR IS156 NOT AVAILABLE IN RECOGNIZED SCOPE / NON-BIS SCOPE REPORT', updatedBy: 'Admin', date: '2026-02-25', published: true }
];

const INITIAL_SERIES = [
  { id: 'SER-2026-001', product: 'Domestic LPG Cylinder Valves', applicant: 'Suraksha Gas Components', requestDate: '2026-01-15', sampleCount: 5, completedReports: 4, pendingReports: 1, status: 'Pending Reports' },
  { id: 'SER-2026-002', product: 'Armoured XLPE Underground Cables', applicant: 'Polycab Wires Pvt Ltd.', requestDate: '2026-01-20', sampleCount: 10, completedReports: 10, pendingReports: 0, status: 'Final Reports' },
  { id: 'SER-2026-003', product: 'Packaged Mineral Water Bottles (500ml)', applicant: 'Bisleri International Pvt Ltd.', requestDate: '2026-02-01', sampleCount: 8, completedReports: 0, pendingReports: 8, status: 'Pending Requests' },
];

const INITIAL_MASTER_DATA = {
  laboratories: ['Mechanical Laboratory', 'Chemical Laboratory', 'Electrical Laboratory', 'Electronics Laboratory', 'Biological Laboratory'],
  sampleTypes: ['Domestic Gas Stove', 'LPG Regulator', 'Rubber Hose Pipe', 'Pressure Cooker', 'Water Motor Pump', 'Insulated Bottle', 'Electrical Cable', 'Smart Meter', 'Mineral Water Jar', 'LED Fixture'],
  standards: ['IS 4246 (2025)', 'IS 2347 (2023)', 'IS 694 (2022)', 'IS 14220 (2022)', 'IS 17526 (2021)', 'IS 16444 (2020)', 'IS 14543 (2024)', 'IS 16107 (2021)'],
  testTypes: ['Routine Testing', 'Type Testing', 'Audit Verification', 'Endurance & Thermal Test', 'Bursting & Hydrostatic Pressure', 'Surge & Impulse Voltage', 'Microbial Culture Test'],
  testParameters: ['Hydrostatic Pressure Burst', 'Thermal Efficiency', 'Flame Resistance', 'Conductor Resistance', 'EMC Emission', 'Coliform & E. Coli', 'Voltage Surge 10kV', 'Insulation Resistance']
};

const INITIAL_SAMPLES = [
  {
    id: '26M-DISP-01',
    product: 'Automotive Engine Oil Filter (Heavy Duty)',
    applicant: 'Bosch Chassis Systems India',
    sampleType: 'Oil Filter Assembly',
    dateReceived: '2026-02-02',
    forwardedOn: '2026-02-02',
    quantity: '2.000',
    standard: 'IS 14587 (2022)',
    requiredTests: 'Pressure Drop & Filtration Efficiency Test',
    documents: ['Bosch_Inward_Challan.pdf'],
    remarks: 'Dispatched by Technical Manager to Mariam Tyagi for testing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-[#26M-DISP-01]',
    allocationDate: '2026-02-02',
    dueDate: '2026-02-22',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '26M-DISP-02',
    product: 'Industrial Flanged Ball Valve (50mm)',
    applicant: 'Audco Valves India Pvt Ltd.',
    sampleType: 'Ball Valve',
    dateReceived: '2026-02-03',
    forwardedOn: '2026-02-03',
    quantity: '1.000',
    standard: 'IS 2016 (2021)',
    requiredTests: 'Hydrostatic Body Shell & Seat Sealing Test',
    documents: ['Audco_Spec_Sheet.pdf'],
    remarks: 'Allocated to Mariam Tyagi; awaiting engineer acceptance.',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-[#26M-DISP-02]',
    allocationDate: '2026-02-03',
    dueDate: '2026-02-25',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '25M3AFE89',
    product: 'Domestic Gas Stove',
    applicant: 'Apex Appliances Ltd.',
    sampleType: 'Domestic Gas Stove',
    dateReceived: '2025-12-28',
    forwardedOn: '2025-12-28',
    quantity: '1.001',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Leakage & Thermal Efficiency',
    documents: ['Inward_Challan_901.pdf', 'Product_Specs_Stove.pdf'],
    remarks: 'Urgent testing required for product licensing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    testBefore: '2 years',
    assignedEngineer: null,
    testRequestId: 'TR-101',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '25MBC0668',
    product: 'LPG Gas Regulator',
    applicant: 'FlameSafe Pvt Ltd.',
    sampleType: 'LPG Gas Regulator',
    dateReceived: '2025-12-28',
    forwardedOn: '2025-12-28',
    quantity: '1.001',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Pressure Burst Test',
    documents: ['Challan_882.pdf'],
    remarks: 'Routine Inward',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    testBefore: '2 years',
    assignedEngineer: null,
    testRequestId: 'TR-102',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '26MNEW-909',
    product: 'Heavy Duty Submersible Motor Pump (7.5HP)',
    applicant: 'Varuna Pumps India',
    sampleType: 'Water Motor Pump',
    dateReceived: '2026-02-01',
    forwardedOn: '2026-02-01',
    quantity: '1.000',
    standard: 'IS 14220 (2022)',
    requiredTests: 'Winding Temperature Rise & Efficiency Test',
    documents: ['Varuna_Inward_Challan.pdf'],
    remarks: 'New sample received from Sample Cell for BIS renewal.',
    priority: 'High',
    testingSection: 'Electrical',
    testType: 'All',
    testBefore: '1 year',
    assignedEngineer: null,
    testRequestId: 'TR-NEW-909',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: 'SUPP-26M901',
    mainSampleId: '25M3AFE89',
    product: 'Triple Burner Gas Stove (Addon Batch)',
    applicant: 'Apex Appliances Ltd.',
    sampleType: 'Domestic Gas Stove',
    dateReceived: '2026-01-10',
    forwardedOn: '2026-01-10',
    quantity: '2.000',
    standard: 'IS 4246 (2025)',
    reason: 'Additional burner thermal efficiency clause re-verification requested by auditor.',
    requiredTests: 'Clause 6.3 Thermal Efficiency',
    documents: ['Supplementary_Req_901.pdf'],
    remarks: 'Supplementary sample received from Sample Cell',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'Tos_101 Pend:1 Appr:0',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-SUPP-901',
    allocationDate: '2026-01-11',
    dueDate: '2026-02-10',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Supplementary Sample Received',
    type: 'Supplementary'
  },
  {
    id: 'SUPP-26M902',
    mainSampleId: '26MB0D2PA',
    product: 'LPG Hose Pipe (High Density Rubber Batch)',
    applicant: 'FlexiGas Polymers',
    sampleType: 'Rubber Hose',
    dateReceived: '2026-01-18',
    forwardedOn: '2026-01-18',
    quantity: '3.000',
    standard: 'IS 4246 (2025)',
    reason: 'Hydrostatic pressure bursting limit re-verification on supplementary roll sample.',
    requiredTests: 'Bursting Pressure & Flame Resistance',
    documents: ['Supp_Hose_Challan.pdf'],
    remarks: 'Supplementary sample from Sample Cell',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-SUPP-902',
    allocationDate: '2026-01-19',
    dueDate: '2026-02-15',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Supplementary Sample Received',
    type: 'Supplementary'
  },
  {
    id: 'AMD-26M402',
    originalSampleId: '26M4D4CE1',
    product: 'Aluminium Pressure Cooker (Modified Lid)',
    applicant: 'Cookwell Kitchenware Ltd.',
    sampleType: 'Aluminium Cooker (5L)',
    dateReceived: '2026-01-15',
    forwardedOn: '2026-01-15',
    quantity: '1.000',
    standard: 'IS 2347 (2023)',
    amendmentReason: 'Lid gasket rubber alloy material spec updated per BIS amendment sheet #2.',
    requiredTests: 'Safety Valve Operating Pressure & Gasket Fitment',
    documents: ['Amendment_Challan_402.pdf'],
    remarks: 'Re-test mandated following drawing revision',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'Tos_101 Pend:1 Appr:0',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-AMD-402',
    allocationDate: '2026-01-16',
    dueDate: '2026-02-20',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Amended Sample Received',
    type: 'Amended'
  },
  {
    id: 'AMD-26M403',
    originalSampleId: '26M-VP-402',
    product: 'Digital Smart Meter (Revised Circuit PCB)',
    applicant: 'Genus Power Infrastructures',
    sampleType: 'Smart Meter',
    dateReceived: '2026-01-20',
    forwardedOn: '2026-01-20',
    quantity: '2.000',
    standard: 'IS 16444 (2020)',
    amendmentReason: 'Optocoupler surge protection circuit layout revised to meet 6kV surge requirement.',
    requiredTests: 'EMC Emission & Impulse Voltage Test',
    documents: ['SmartMeter_Amend_Spec.pdf'],
    remarks: 'Amended sample received for surge testing',
    priority: 'High',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-AMD-403',
    allocationDate: '2026-01-21',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Amended Sample Received',
    type: 'Amended'
  },
  {
    id: 'REQ-8801',
    sampleId: '26M695518',
    product: 'Gas Stove Valve (High Pressure)',
    applicant: 'Suraksha Components',
    sampleType: 'Gas Fitting',
    dateReceived: '2026-01-20',
    forwardedOn: '2026-01-20',
    quantity: '1.000',
    standard: 'IS 2347 (2023)',
    reason: 'Applicant requested re-testing for high-temperature valve seat endurance.',
    requestedBy: 'Suraksha Quality Manager',
    requestDate: '2026-01-20',
    requiredTests: 'Endurance Test at 120°C',
    documents: ['Retest_Request_8801.pdf'],
    remarks: 'Pending Manager Approval for Retest',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-REQ-8801',
    allocationDate: null,
    dueDate: '2026-02-25',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Pending Amendment Requests',
    type: 'Amendment Request'
  },
  {
    id: 'REQ-8802',
    sampleId: '26M-SS-301',
    product: 'Armoured Underground Cable (XLPE 1.1kV)',
    applicant: 'Polycab Wires Pvt Ltd.',
    sampleType: 'Electrical Cable',
    dateReceived: '2026-01-25',
    forwardedOn: '2026-01-25',
    quantity: '10.00',
    standard: 'IS 694 (2022)',
    reason: 'Re-evaluation requested for outer sheath thermal aging resistance.',
    requestedBy: 'Polycab QC Head',
    requestDate: '2026-01-25',
    requiredTests: 'Thermal Aging & Tensile Strength',
    documents: ['Cable_Retest_Req.pdf'],
    remarks: 'Pending Amendment Request',
    priority: 'Medium',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-REQ-8802',
    allocationDate: null,
    dueDate: '2026-02-28',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Pending Amendment Requests',
    type: 'Amendment Request'
  },
  {
    id: '26M-ALLOC-01',
    product: 'Stainless Steel Water Flask (1000ml)',
    applicant: 'HydroPure Flasks Pvt Ltd.',
    sampleType: 'Insulated Bottle',
    dateReceived: '2026-01-22',
    forwardedOn: '2026-01-22',
    quantity: '2.000',
    standard: 'IS 17526 (2021)',
    requiredTests: 'Leaching & Heat Retention Test',
    documents: ['HydroPure_Inward.pdf'],
    remarks: 'Assigned to Chemical testing section.',
    priority: 'Medium',
    testingSection: 'Chemical',
    testType: 'All',
    assignedEngineer: 'Rajesh Kumar',
    testRequestId: 'TR-201',
    allocationDate: '2026-01-23',
    dueDate: '2026-02-15',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '26M-SS-301',
    product: 'Armoured Underground Copper Cable (4-Core)',
    applicant: 'Polycab Wires Pvt Ltd.',
    sampleType: 'Electrical Cable',
    dateReceived: '2026-01-29',
    forwardedOn: '2026-01-29',
    quantity: '10.00',
    standard: 'IS 694 (2022)',
    requiredTests: 'Conductor Resistance & High Voltage Spark Test',
    documents: ['Polycab_Inward.pdf'],
    remarks: 'Allocated to Sunita Sharma.',
    priority: 'High',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-SS-301',
    allocationDate: '2026-01-30',
    dueDate: '2026-02-28',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '26M-AD-501',
    product: 'Packaged Mineral Drinking Water (20L Jar)',
    applicant: 'Bisleri International Pvt Ltd.',
    sampleType: 'Water Sample',
    dateReceived: '2026-01-28',
    forwardedOn: '2026-01-28',
    quantity: '20.00',
    standard: 'IS 14543 (2024)',
    requiredTests: 'Coliforms, E. Coli & Microbial Culture',
    documents: ['Bisleri_Water_Doc.pdf'],
    remarks: 'Assigned to Ananya Deshmukh in Biological lab.',
    priority: 'High',
    testingSection: 'Biological',
    testType: 'All',
    assignedEngineer: 'Ananya Deshmukh',
    testRequestId: 'TR-AD-501',
    allocationDate: '2026-01-29',
    dueDate: '2026-02-14',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-PROG-02',
    product: 'Electric Induction Cooktop (2000W)',
    applicant: 'Voltz Electronics India',
    sampleType: 'Induction Appliance',
    dateReceived: '2026-01-25',
    forwardedOn: '2026-01-25',
    quantity: '1.000',
    standard: 'IS 3025 (2021)',
    requiredTests: 'Insulation Resistance & Voltage Surge',
    documents: ['Voltz_Elec_Challan.pdf'],
    remarks: 'Under active electrical testing.',
    priority: 'High',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-305',
    allocationDate: '2026-01-26',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-HS-101',
    product: 'Automotive Hydraulic Brake Hose Assembly',
    applicant: 'AutoFlex India Components',
    sampleType: 'Brake Hose',
    dateReceived: '2026-01-28',
    forwardedOn: '2026-01-28',
    quantity: '2.000',
    standard: 'IS 7079 (2020)',
    requiredTests: 'Hydrostatic Burst & Expansion Test',
    documents: ['AutoFlex_Spec.pdf'],
    remarks: 'Assigned to Harendra Singh for high-pressure testing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-HS-101',
    allocationDate: '2026-01-29',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-VP-401',
    product: 'LED Street Light Luminaire (120W)',
    applicant: 'Wipro Lighting Ltd.',
    sampleType: 'LED Fixture',
    dateReceived: '2026-01-27',
    forwardedOn: '2026-01-27',
    quantity: '2.000',
    standard: 'IS 16107 (2021)',
    requiredTests: 'Surge Protection 10kV & THD Measurement',
    documents: ['Wipro_Lighting_Inward.pdf'],
    remarks: 'Assigned to Dr. Vikram Patel in Electronics lab.',
    priority: 'High',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-VP-401',
    allocationDate: '2026-01-28',
    dueDate: '2026-02-16',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M4D4CE1',
    product: 'Aluminium Pressure Cooker',
    applicant: 'Cookwell Kitchenware Ltd.',
    sampleType: 'Aluminium Cooker (5L)',
    dateReceived: '2026-01-27',
    forwardedOn: '2026-01-27',
    quantity: '1.001',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Hydrostatic Pressure & Safety Valve Test',
    documents: ['Inward_Cookwell_322.pdf'],
    remarks: 'Routine compliance testing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'Tos_101 Pend:0 Appr:101',
    testBefore: '15 days',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-103',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-15',
    testResults: 'Passed hydrostatic test at 3.0 kg/cm² pressure without deformation.',
    testDate: '2026-05-05',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26MB0D2PA',
    product: 'LPG Hose Pipe (Reinforced 1.5m)',
    applicant: 'FlexiGas Polymers',
    sampleType: 'Rubber Hose',
    dateReceived: '2026-01-28',
    forwardedOn: '2026-01-28',
    quantity: '3.000',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Tensile Strength & Gas Permeability',
    documents: ['FlexiGas_Inward.pdf'],
    remarks: 'Tested by Mariam Tyagi; awaiting manager approval.',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'Tos_167 Pend:0 Appr:167',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-167',
    allocationDate: '2026-01-28',
    dueDate: '2026-02-20',
    testResults: 'Tensile strength 14.5 MPa (spec > 12 MPa). Zero leakage observed.',
    testDate: '2026-02-02',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-HS-102',
    product: 'Cast Iron Sluice Valve (150mm)',
    applicant: 'Kirloskar Valves Ltd.',
    sampleType: 'Sluice Valve',
    dateReceived: '2026-01-24',
    forwardedOn: '2026-01-24',
    quantity: '1.000',
    standard: 'IS 14846 (2020)',
    requiredTests: 'Hydrostatic Seat & Body Test',
    documents: ['Sluice_Valve_Inward.pdf'],
    remarks: 'Tested by Harendra Singh.',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'Tos_101 Pend:0 Appr:101',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-HS-102',
    allocationDate: '2026-01-25',
    dueDate: '2026-02-12',
    testResults: 'Seat test 1.6 MPa passed. Body pressure test 2.4 MPa passed without seepage.',
    testDate: '2026-02-02',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: 'REP-PEND-01',
    product: 'Industrial Pressure Gauge (0-10 Bar)',
    applicant: 'Precision Instruments Ltd.',
    sampleType: 'Measurement Instrument',
    dateReceived: '2026-01-18',
    forwardedOn: '2026-01-18',
    quantity: '1.000',
    standard: 'IS 3025 (2021)',
    requiredTests: 'Calibration & Hysteresis Test',
    documents: ['Gauge_Spec.pdf'],
    remarks: 'Verified by Technical Manager; pending report compilation.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-8819',
    allocationDate: '2026-01-19',
    dueDate: '2026-02-05',
    testResults: 'Verified accurate within ±0.5% full scale.',
    testDate: '2026-02-01',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-8819',
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Reports Pending',
    type: 'New'
  },
  {
    id: '26M-VP-403',
    product: 'Uninterruptible Power Supply (UPS 3kVA)',
    applicant: 'APC Schneider Electric',
    sampleType: 'UPS Unit',
    dateReceived: '2026-01-16',
    forwardedOn: '2026-01-16',
    quantity: '1.000',
    standard: 'IS 16242 (2021)',
    requiredTests: 'Crest Factor & Battery Backup Duration',
    documents: ['APC_UPS_Challan.pdf'],
    remarks: 'Verified; pending final report release.',
    priority: 'Medium',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-VP-403',
    allocationDate: '2026-01-17',
    dueDate: '2026-02-06',
    testResults: 'Waveform crest factor < 3:1. Battery backup duration verified at 42 mins under rated load.',
    testDate: '2026-01-29',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-EC45',
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Reports Pending',
    type: 'New'
  },
  {
    id: 'AMD-REP-02',
    product: 'Submersible Pump Motor (5HP)',
    applicant: 'Kirloskar Pumps Ltd.',
    sampleType: 'Water Pump',
    dateReceived: '2026-01-12',
    forwardedOn: '2026-01-12',
    quantity: '1.000',
    standard: 'IS 2347 (2023)',
    amendmentReason: 'Correction requested for report address and serial number formatting.',
    requiredTests: 'Efficiency & Insulation Test',
    documents: ['Report_Amend_Req.pdf'],
    remarks: 'Report returned for address amendment',
    priority: 'Medium',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-9902',
    allocationDate: '2026-01-13',
    dueDate: '2026-02-12',
    testResults: 'Passes specs',
    testDate: '2026-01-30',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'AMD-REP-2026-02',
    reportDate: '2026-02-01',
    reportingManager: 'Neha Chaudhry',
    status: 'Amended Reports Pending',
    type: 'Amended Report'
  },
  {
    id: '26M695518',
    product: 'Gas Stove Valve',
    applicant: 'Suraksha Components',
    sampleType: 'Gas Fitting',
    dateReceived: '2026-01-27',
    forwardedOn: '2026-01-27',
    quantity: '1.001',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Leakage & Valve Endurance',
    documents: ['Suraksha_Challan.pdf'],
    remarks: 'Compliance audit sample',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'Tos_101 Pend:0 Appr:101',
    testBefore: '15 days',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-104',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-15',
    testResults: 'Passes specs',
    testDate: '2026-05-05',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-9081',
    reportDate: '2026-05-06',
    reportingManager: 'S. P. Yadav',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-SS-303',
    product: 'Grid-Tied Solar Inverter (5kW)',
    applicant: 'Luminous Power Technologies',
    sampleType: 'Solar Inverter',
    dateReceived: '2026-01-14',
    forwardedOn: '2026-01-14',
    quantity: '1.000',
    standard: 'IS 16221 (2022)',
    requiredTests: 'Anti-Islanding Protection & Peak Efficiency',
    documents: ['Luminous_Spec.pdf'],
    remarks: 'Testing completed & verified by manager.',
    priority: 'Medium',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-SS-303',
    allocationDate: '2026-01-15',
    dueDate: '2026-02-04',
    testResults: 'Efficiency measured at 97.8%. Anti-islanding protection trip time < 0.2s.',
    testDate: '2026-01-27',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-EL89',
    reportDate: '2026-01-29',
    reportingManager: 'S. P. Yadav',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-AD-503',
    product: 'Bio-Degradable Compostable Carry Bag',
    applicant: 'Ecovision Polymers Ltd.',
    sampleType: 'Compostable Plastic',
    dateReceived: '2026-01-10',
    forwardedOn: '2026-01-10',
    quantity: '5.000',
    standard: 'IS 17088 (2021)',
    requiredTests: 'Ultimate Aerobic Biodegradation in Compost',
    documents: ['Ecovision_Inward.pdf'],
    remarks: 'Testing completed & verified by manager.',
    priority: 'Low',
    testingSection: 'Biological',
    testType: 'All',
    assignedEngineer: 'Ananya Deshmukh',
    testRequestId: 'TR-AD-503',
    allocationDate: '2026-01-11',
    dueDate: '2026-02-01',
    testResults: 'Ultimate aerobic biodegradation reached 92.4% in 180 days compost test.',
    testDate: '2026-01-25',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-BIO12',
    reportDate: '2026-01-27',
    reportingManager: 'Neha Chaudhry',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-MECH-103',
    product: 'Stainless Steel Vacuum Thermos Bottle (750ml)',
    applicant: 'HydroFlask India Ltd.',
    sampleType: 'Insulated Bottle',
    dateReceived: '2026-02-02',
    forwardedOn: '2026-02-02',
    quantity: '2.000',
    standard: 'IS 17526 (2021)',
    requiredTests: 'Thermal Insulation Retention & Vacuum Seal Test',
    documents: ['HydroFlask_Inward_Spec.pdf'],
    remarks: 'New inward sample received from Sample Cell.',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: null,
    testRequestId: 'TR-MECH-103',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '26M-MECH-104',
    product: 'Commercial High Pressure Gas Burner (Double Ring)',
    applicant: 'FlameStar Industrial Systems',
    sampleType: 'Industrial Burner',
    dateReceived: '2026-01-30',
    forwardedOn: '2026-01-30',
    quantity: '1.000',
    standard: 'IS 4246 (2025)',
    requiredTests: 'High Pressure Gas Leakage & Combustion Stability',
    documents: ['FlameStar_Inward_Challan.pdf'],
    remarks: 'Under active mechanical testing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-MECH-104',
    allocationDate: '2026-01-31',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-MECH-105',
    product: 'Brass Safety Relief Valve (1/2 Inch)',
    applicant: 'Swagelok Fluid Systems',
    sampleType: 'Safety Valve',
    dateReceived: '2026-01-26',
    forwardedOn: '2026-01-26',
    quantity: '2.000',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Set Pressure Pop Test & Seat Leakage',
    documents: ['Swagelok_Valve_Doc.pdf'],
    remarks: 'Tested by Mariam Tyagi; awaiting verification.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-MECH-105',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-14',
    testResults: 'Pop pressure verified at 4.2 Bar. Seat leak tight at 3.5 Bar. Passed.',
    testDate: '2026-02-03',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-MECH-106',
    product: 'Automotive Exhaust Muffler Pipe',
    applicant: 'Maruti Suzuki Components Ltd.',
    sampleType: 'Automotive Part',
    dateReceived: '2026-01-20',
    forwardedOn: '2026-01-20',
    quantity: '1.000',
    standard: 'IS 7079 (2020)',
    requiredTests: 'Vibration Endurance & Exhaust Backpressure',
    documents: ['Maruti_Muffler_Spec.pdf'],
    remarks: 'Verified by manager; pending report release.',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Harendra Singh',
    testRequestId: 'TR-MECH-106',
    allocationDate: '2026-01-21',
    dueDate: '2026-02-10',
    testResults: 'Backpressure < 12 kPa at 4000 RPM. Zero weld cracks after 100h vibration.',
    testDate: '2026-01-31',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-M88',
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Reports Pending',
    type: 'New'
  },
  {
    id: '26M-MECH-107',
    product: 'Centrifugal Water Pump Impeller (Bronze)',
    applicant: 'Crompton Greaves Consumer Electricals',
    sampleType: 'Pump Component',
    dateReceived: '2026-01-15',
    forwardedOn: '2026-01-15',
    quantity: '1.000',
    standard: 'IS 14220 (2022)',
    requiredTests: 'Dynamic Balancing & Cavitation Erosion Test',
    documents: ['Crompton_Impeller_Doc.pdf'],
    remarks: 'Testing completed & verified.',
    priority: 'Low',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-MECH-107',
    allocationDate: '2026-01-16',
    dueDate: '2026-02-05',
    testResults: 'Residual unbalance < 0.5 g-mm/kg (ISO G2.5 grade). No cavitation pits.',
    testDate: '2026-01-28',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-M99',
    reportDate: '2026-01-30',
    reportingManager: 'S. P. Yadav',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-ELEC-304',
    product: 'Miniature Circuit Breaker (MCB 32A Triple Pole)',
    applicant: 'Havells India Switchgear Division',
    sampleType: 'Circuit Breaker',
    dateReceived: '2026-02-03',
    forwardedOn: '2026-02-03',
    quantity: '3.000',
    standard: 'IS 60898 (2020)',
    requiredTests: 'Short Circuit Tripping Capacity (10kA) & Thermal Release',
    documents: ['Havells_MCB_Inward.pdf'],
    remarks: 'New sample received from Sample Cell for ISI marking renewal.',
    priority: 'High',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: null,
    testRequestId: 'TR-ELEC-304',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '26M-ELEC-305',
    product: 'Ceiling Fan Super Efficient BLDC Motor (28W)',
    applicant: 'Atomberg Technologies Pvt Ltd.',
    sampleType: 'BLDC Ceiling Fan',
    dateReceived: '2026-01-31',
    forwardedOn: '2026-01-31',
    quantity: '2.000',
    standard: 'IS 374 (2022)',
    requiredTests: 'Air Delivery (230 m³/min) & Power Consumption',
    documents: ['Atomberg_Fan_Spec.pdf'],
    remarks: 'Allocated to Sunita Sharma.',
    priority: 'Medium',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-ELEC-305',
    allocationDate: '2026-02-01',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '26M-ELEC-306',
    product: 'Electric Storage Water Heater (25L Star Rated)',
    applicant: 'Bajaj Electricals Ltd.',
    sampleType: 'Geyser Appliance',
    dateReceived: '2026-01-25',
    forwardedOn: '2026-01-25',
    quantity: '1.000',
    standard: 'IS 2082 (2021)',
    requiredTests: 'Standing Loss 24h & High Voltage Insulation (2.5kV)',
    documents: ['Bajaj_Geyser_Challan.pdf'],
    remarks: 'Electrical findings submitted by Sunita Sharma.',
    priority: 'High',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-ELEC-306',
    allocationDate: '2026-01-26',
    dueDate: '2026-02-14',
    testResults: 'Standing loss 0.42 kWh/24h (Star Level 5 compliant). High voltage dielectric 2.5kV passed.',
    testDate: '2026-02-02',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-ELEC-307',
    product: 'Polyvinyl Insulated Flexible Copper Wire (90m Roll)',
    applicant: 'Finolex Cables Ltd.',
    sampleType: 'Building Wire',
    dateReceived: '2026-01-18',
    forwardedOn: '2026-01-18',
    quantity: '90.00',
    standard: 'IS 694 (2022)',
    requiredTests: 'Conductor Resistance (12.1 Ω/km) & Flame Retardance',
    documents: ['Finolex_Wire_Doc.pdf'],
    remarks: 'Testing completed & verified.',
    priority: 'Medium',
    testingSection: 'Electrical',
    testType: 'All',
    assignedEngineer: 'Sunita Sharma',
    testRequestId: 'TR-ELEC-307',
    allocationDate: '2026-01-19',
    dueDate: '2026-02-08',
    testResults: 'Conductor resistance 11.8 Ω/km (spec < 12.1 Ω/km). Oxygen index 32% (FR grade). Passed.',
    testDate: '2026-01-30',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-E44',
    reportDate: '2026-02-01',
    reportingManager: 'S. P. Yadav',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-CHEM-204',
    product: 'Ordinary Portland Cement (43 Grade 50kg Bag)',
    applicant: 'Ambuja Cements Ltd.',
    sampleType: 'Cement Powder',
    dateReceived: '2026-02-02',
    forwardedOn: '2026-02-02',
    quantity: '50.00',
    standard: 'IS 269 (2021)',
    requiredTests: 'Chemical Composition & Compressive Strength 28 Days',
    documents: ['Ambuja_Inward_Batch.pdf'],
    remarks: 'New inward sample received for chemical testing.',
    priority: 'High',
    testingSection: 'Chemical',
    testType: 'All',
    assignedEngineer: null,
    testRequestId: 'TR-CHEM-204',
    allocationDate: null,
    dueDate: null,
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '26M-CHEM-205',
    product: 'Agricultural Irrigation PVC Suction Hose (50mm)',
    applicant: 'Supreme Industries Ltd.',
    sampleType: 'Flexible PVC Hose',
    dateReceived: '2026-01-29',
    forwardedOn: '2026-01-29',
    quantity: '5.000',
    standard: 'IS 4985 (2021)',
    requiredTests: 'Hydrostatic Pressure & Plasticizer Migration',
    documents: ['Supreme_Hose_Spec.pdf'],
    remarks: 'Under active chemical evaluation by Rajesh Kumar.',
    priority: 'Medium',
    testingSection: 'Chemical',
    testType: 'All',
    assignedEngineer: 'Rajesh Kumar',
    testRequestId: 'TR-CHEM-205',
    allocationDate: '2026-01-30',
    dueDate: '2026-02-17',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-CHEM-206',
    product: 'PET Plastic Beverage Bottle Preform (500ml)',
    applicant: 'Manjushree Polymers Ltd.',
    sampleType: 'PET Preform',
    dateReceived: '2026-01-26',
    forwardedOn: '2026-01-26',
    quantity: '10.00',
    standard: 'IS 6312 (2021)',
    requiredTests: 'Acetaldehyde Content (AA) & Overall Migration',
    documents: ['Manjushree_PET_Challan.pdf'],
    remarks: 'Chemical test results submitted by Rajesh Kumar.',
    priority: 'High',
    testingSection: 'Chemical',
    testType: 'All',
    assignedEngineer: 'Rajesh Kumar',
    testRequestId: 'TR-CHEM-206',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-15',
    testResults: 'Acetaldehyde level 1.2 ppm (spec < 3 ppm). Overall migration in 10% ethanol passed.',
    testDate: '2026-02-02',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-CHEM-207',
    product: 'Stainless Steel Cutlery Set Grade SS304',
    applicant: 'KitchenCraft Utensils Pvt Ltd.',
    sampleType: 'Stainless Steel Utensil',
    dateReceived: '2026-01-21',
    forwardedOn: '2026-01-21',
    quantity: '12.00',
    standard: 'IS 17526 (2021)',
    requiredTests: 'Chromium-Nickel Alloy Composition (18/8) & Corrosion Resistance',
    documents: ['KitchenCraft_Spec.pdf'],
    remarks: 'Verified by Technical Manager; pending report release.',
    priority: 'Low',
    testingSection: 'Chemical',
    testType: 'All',
    assignedEngineer: 'Rajesh Kumar',
    testRequestId: 'TR-CHEM-207',
    allocationDate: '2026-01-22',
    dueDate: '2026-02-10',
    testResults: 'Cr 18.2%, Ni 8.4% (SS304 compliant). 24h salt spray corrosion resistance passed.',
    testDate: '2026-01-31',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-CH88',
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Reports Pending',
    type: 'New'
  },
  {
    id: '26M-ELEC-404',
    product: 'Digital Multimeter Class 0.5 (Industrial Grade)',
    applicant: 'Fluke Industrial Instruments',
    sampleType: 'Measuring Instrument',
    dateReceived: '2026-01-28',
    forwardedOn: '2026-01-28',
    quantity: '1.000',
    standard: 'IS 13875 (2021)',
    reason: 'Supplementary calibration sample for high-precision DC voltage scale.',
    requiredTests: 'DC Voltage Accuracy 1000V & Overload Protection',
    documents: ['Fluke_Multimeter_Supp.pdf'],
    remarks: 'Supplementary sample received from Sample Cell.',
    priority: 'Medium',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-ELEC-404',
    allocationDate: '2026-01-29',
    dueDate: '2026-02-16',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Supplementary Sample Received',
    type: 'Supplementary'
  },
  {
    id: '26M-ELEC-405',
    product: 'Solar PV Module Monocrystalline (540W)',
    applicant: 'Tata Power Solar Systems',
    sampleType: 'Solar PV Panel',
    dateReceived: '2026-01-27',
    forwardedOn: '2026-01-27',
    quantity: '2.000',
    standard: 'IS 14286 (2020)',
    requiredTests: 'Thermal Cycling -40°C to +85°C & Damp Heat Test',
    documents: ['Tata_Solar_Inward.pdf'],
    remarks: 'Under active environmental chamber testing by Dr. Vikram Patel.',
    priority: 'High',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-ELEC-405',
    allocationDate: '2026-01-28',
    dueDate: '2026-02-20',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'S. P. Yadav',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-ELEC-406',
    product: 'Automatic Voltage Stabilizer (5kVA Mainline)',
    applicant: 'V-Guard Industries Ltd.',
    sampleType: 'Voltage Stabilizer',
    dateReceived: '2026-01-14',
    forwardedOn: '2026-01-14',
    quantity: '1.000',
    standard: 'IS 9815 (2021)',
    requiredTests: 'High/Low Cut-Off Speed & Relay Cycling Test',
    documents: ['VGuard_Stabilizer_Doc.pdf'],
    remarks: 'Testing completed & report sent to Sample Cell.',
    priority: 'Medium',
    testingSection: 'Electronics',
    testType: 'All',
    assignedEngineer: 'Dr. Vikram Patel',
    testRequestId: 'TR-ELEC-406',
    allocationDate: '2026-01-15',
    dueDate: '2026-02-05',
    testResults: 'Cut-off response time 18ms. Output regulation 220V ± 5% across 90V-280V input range.',
    testDate: '2026-01-28',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-EC88',
    reportDate: '2026-01-30',
    reportingManager: 'S. P. Yadav',
    status: 'Testing Completed',
    type: 'New'
  },
  {
    id: '26M-BIO-504',
    product: 'Disinfectant Liquid Cleaner Concentrated (5L)',
    applicant: 'Reckitt Benckiser (Dettol Commercial)',
    sampleType: 'Disinfectant Chemical',
    dateReceived: '2026-01-26',
    forwardedOn: '2026-01-26',
    quantity: '5.000',
    standard: 'IS 1061 (2021)',
    amendmentReason: 'Active phenolics concentration formula updated per BIS amendment sheet #1.',
    requiredTests: 'Rideal-Walker Phenol Coefficient & Antimicrobial Efficacy',
    documents: ['Dettol_Amend_Challan.pdf'],
    remarks: 'Amended sample received for microbial evaluation.',
    priority: 'Medium',
    testingSection: 'Biological',
    testType: 'All',
    assignedEngineer: 'Ananya Deshmukh',
    testRequestId: 'TR-BIO-504',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-18',
    testResults: null,
    testDate: null,
    resultStatus: 'Pending',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: null,
    status: 'Amended Sample Received',
    type: 'Amended'
  },
  {
    id: '26M-BIO-505',
    product: 'Medical Grade Latex Examination Gloves (Powdered)',
    applicant: 'Safetouch Gloves India Pvt Ltd.',
    sampleType: 'Surgical Gloves',
    dateReceived: '2026-01-22',
    forwardedOn: '2026-01-22',
    quantity: '100.0',
    standard: 'IS 4148 (2022)',
    requiredTests: 'Pinhole Water Leak Test & Tensile Strength Before/After Aging',
    documents: ['Safetouch_Gloves_Doc.pdf'],
    remarks: 'Biological findings submitted by Ananya Deshmukh.',
    priority: 'High',
    testingSection: 'Biological',
    testType: 'All',
    assignedEngineer: 'Ananya Deshmukh',
    testRequestId: 'TR-BIO-505',
    allocationDate: '2026-01-23',
    dueDate: '2026-02-12',
    testResults: 'Pinhole test 0 defects per 100 gloves. Tensile strength 18.4 MPa (spec > 14 MPa). Passed.',
    testDate: '2026-02-01',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: null,
    reportDate: null,
    reportingManager: 'Neha Chaudhry',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-REC-01',
    product: 'Domestic Gas Stove (Batch 2026)',
    applicant: 'Apex Appliances Ltd.',
    sampleType: 'Domestic Gas Stove',
    dateReceived: '2026-02-05',
    forwardedOn: '2026-02-05',
    allocationDate: '2026-02-06',
    quantity: '1.001',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Thermal Efficiency Clause 6.2',
    documents: ['Inward_Challan_2026.pdf'],
    remarks: 'Dispatched by TM V. K. Jain for testing',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-REC-101',
    dueDate: '2026-03-01',
    status: 'Samples Allocated',
    type: 'New'
  },
  {
    id: '26M-REC-02',
    product: 'LPG Safety Regulator Valve',
    applicant: 'FlameSafe Pvt Ltd.',
    sampleType: 'LPG Regulator',
    dateReceived: '2026-02-06',
    forwardedOn: '2026-02-06',
    allocationDate: '2026-02-07',
    quantity: '2.000',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Pressure Leakage & Endurance',
    documents: ['Challan_Regulator.pdf'],
    remarks: 'Assigned to Mariam Tyagi',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-REC-102',
    dueDate: '2026-03-05',
    status: 'New Sample Received',
    type: 'New'
  },
  {
    id: '26M-PEND-01',
    product: 'Aluminium Pressure Cooker (5L Model)',
    applicant: 'Cookwell Kitchenware',
    sampleType: 'Aluminium Cooker',
    dateReceived: '2026-02-01',
    forwardedOn: '2026-02-01',
    allocationDate: '2026-02-02',
    testStartDate: '2026-02-03',
    quantity: '1.000',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Hydrostatic Burst Test',
    documents: ['Cookwell_Spec_Doc.pdf'],
    remarks: 'Active testing in progress by Mariam Tyagi',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-COOK-901',
    dueDate: '2026-02-25',
    status: 'Testing In Progress',
    type: 'New'
  },
  {
    id: '26M-PEND-02',
    product: 'Reinforced Rubber LPG Hose (2m)',
    applicant: 'FlexiGas Polymers',
    sampleType: 'Rubber Hose',
    dateReceived: '2026-02-02',
    forwardedOn: '2026-02-02',
    acceptedDate: '2026-02-02',
    quantity: '3.000',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Tensile Strength & Gas Permeability',
    documents: ['Hose_Inward_Challan.pdf'],
    remarks: 'Accepted sample queued in lab',
    priority: 'Medium',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-HOSE-902',
    dueDate: '2026-02-28',
    status: 'Pending',
    type: 'New'
  },
  {
    id: '26M-REP-01',
    product: 'Brass Safety Relief Valve (1/2 Inch)',
    applicant: 'Swagelok Fluid Systems',
    sampleType: 'Safety Valve',
    dateReceived: '2026-01-26',
    forwardedOn: '2026-01-26',
    quantity: '2.000',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Set Pressure Pop Test & Seat Leakage',
    documents: ['Swagelok_Valve_Doc.pdf'],
    remarks: 'Tested by Mariam Tyagi; submitted to TM for verification.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-VALVE-801',
    allocationDate: '2026-01-27',
    dueDate: '2026-02-14',
    testResults: 'Pop pressure verified at 4.2 Bar. Seat leak tight at 3.5 Bar. Passed.',
    testDate: '2026-02-03',
    resultStatus: 'Completed',
    verificationStatus: 'Pending Verification',
    reportNumber: 'REP-2026-M105',
    reportDate: '2026-02-04',
    reportingManager: 'V. K. Jain',
    status: 'Test Results Pending Verification',
    type: 'New'
  },
  {
    id: '26M-REP-02',
    product: 'Automotive Hydraulic Brake Hose Assembly',
    applicant: 'AutoFlex India Components',
    sampleType: 'Brake Hose',
    dateReceived: '2026-01-28',
    forwardedOn: '2026-01-28',
    quantity: '2.000',
    standard: 'IS 7079 (2020)',
    requiredTests: 'Hydrostatic Burst & Expansion Test',
    documents: ['AutoFlex_Spec.pdf'],
    remarks: 'Tested by Mariam Tyagi; verified by TM and issued.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-BRAKE-802',
    allocationDate: '2026-01-29',
    testResults: 'Burst pressure 22 MPa (spec > 18 MPa). Expansion < 0.8 cc/m. Passed.',
    testDate: '2026-01-30',
    resultStatus: 'Completed',
    verificationStatus: 'Verified',
    reportNumber: 'REP-2026-M888',
    reportDate: '2026-02-01',
    reportingManager: 'V. K. Jain',
    status: 'Sent to Sample Cell',
    type: 'New'
  },
  {
    id: '26M-DSP-01',
    disputeId: 'DSP-2026-01',
    product: 'High Pressure Industrial Gas Regulator',
    applicant: 'FlameSafe Pvt Ltd.',
    sampleType: 'LPG Regulator',
    dateReceived: '2026-02-01',
    forwardedOn: '2026-02-01',
    quantity: '2.000',
    standard: 'IS 4246 (2025)',
    requiredTests: 'Hydrostatic Pressure & Leakage Test',
    documents: ['Dispute_Notice_01.pdf'],
    remarks: 'Disputed sample due to specification deviation during burst pressure testing.',
    priority: 'High',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: 'Mariam Tyagi',
    testRequestId: 'TR-DSP-01',
    allocationDate: '2026-02-02',
    dueDate: '2026-02-25',
    is_disputed: true,
    isDisputed: true,
    dispute_status: 'OPEN',
    disputeStatus: 'OPEN',
    disputeReason: 'Manufacturer auditor challenged pressure transducer calibration accuracy during burst test.',
    disputeDate: '2026-02-04',
    status: 'Disputed',
    type: 'New'
  },
  {
    id: '26M-WITH-01',
    product: 'Commercial Kitchen Pressure Vessel (50L)',
    applicant: 'HotMax Kitchenware Solutions',
    sampleType: 'Pressure Cooker',
    dateReceived: '2026-01-25',
    forwardedOn: '2026-01-25',
    quantity: '1.000',
    standard: 'IS 2347 (2023)',
    requiredTests: 'Pneumatic Shell Pressure Test',
    documents: ['Withdrawal_Letter.pdf'],
    remarks: 'Sample formally withdrawn by applicant.',
    priority: 'Low',
    testingSection: 'Mechanical',
    testType: 'All',
    assignedEngineer: null,
    testRequestId: 'TR-WITH-01',
    withdrawalDate: '2026-02-03',
    withdrawalReason: 'Applicant surrendered BIS application due to manufacturing line recall.',
    status: 'WITHDRAWN',
    type: 'New'
  }
];

const INITIAL_SAMPLE_REQUESTS = [
  { id: 'REQ-RET-101', sampleId: '26M-DISP-01', product: 'Automotive Engine Oil Filter (Heavy Duty)', type: 'RETURN', requestDate: '2026-02-05', reason: 'Applicant requested return of physical sample after non-destructive test.', status: 'PENDING', requestedBy: 'Bosch QC Head' },
  { id: 'REQ-RET-102', sampleId: '25M3AFE89', product: 'Domestic Gas Stove', type: 'RETURN', requestDate: '2026-02-06', reason: 'Return requested for auditing secondary valve component.', status: 'PENDING', requestedBy: 'Apex Quality Team' },
  { id: 'REQ-DISC-201', sampleId: '26M-ALLOC-01', product: 'Stainless Steel Water Flask (1000ml)', type: 'DISCARD', requestDate: '2026-02-04', reason: 'Sample ruptured during destructive hydrostatic pressure test; hazardous remnant disposal requested.', status: 'PENDING', requestedBy: 'Chemical Testing Section' },
  { id: 'REQ-DISC-202', sampleId: 'SUPP-26M902', product: 'LPG Hose Pipe (High Density Rubber Batch)', type: 'DISCARD', requestDate: '2026-02-07', reason: 'Post-test rubber debris disposal authorized by section supervisor.', status: 'PENDING', requestedBy: 'Harendra Singh (Eng)' }
];

const INITIAL_CLARIFICATIONS = [
  {
    id: '72022',
    sampleId: '25M3AFE89',
    subject: 'Missing Circuit Schematic for Spark Generator',
    clarification: 'Missing circuit wiring layout for piezoelectric spark igniter.',
    receivedFrom: 'Technical Team (Harendra)',
    dateReceived: '2025-12-06',
    assignedEngineer: 'Harendra Singh',
    raisedBy: 'Harendra Singh',
    dateRaised: '2025-12-06',
    sentTo: 'Sample Cell',
    status: 'Open',
    response: null,
    responseDate: null,
    sampleStatus: 'Testing In Progress'
  },
  {
    id: '72020',
    sampleId: '25M7TF584',
    subject: 'Verification of Copper Purity Certificate',
    clarification: 'Kindly upload the alloy purity certificate for sample batch 88.',
    receivedFrom: 'Sample Cell',
    dateReceived: '2025-12-06',
    assignedEngineer: 'Mariam Tyagi',
    raisedBy: 'Mariam Tyagi',
    dateRaised: '2025-12-06',
    sentTo: 'Sample Cell',
    status: 'Open',
    response: null,
    responseDate: null,
    sampleStatus: 'Testing In Progress'
  }
];

export const WorkflowProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme] = useState('light');
  
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ntb_auth') === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ntb_user');
    return saved ? JSON.parse(saved) : { name: 'V. K. Jain', role: 'Technical Manager', avatar: 'VJ', email: 'vk.jain@ntb.gov.in' };
  });

  const [selectedRole, setSelectedRole] = useState(() => currentUser?.role || 'Technical Manager');
  const [selectedEngineer, setSelectedEngineer] = useState('Mariam Tyagi');

  const [samples, setSamples] = useState(() => {
    const saved = localStorage.getItem('ntb_samples');
    if (!saved) return INITIAL_SAMPLES;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_SAMPLES;
      
      const parsedMap = new Map(parsed.map(s => [s.id, s]));
      INITIAL_SAMPLES.forEach(initSample => {
        if (!parsedMap.has(initSample.id)) {
          parsedMap.set(initSample.id, initSample);
        } else {
          const existing = parsedMap.get(initSample.id);
          if (!existing.assignedEngineer && initSample.assignedEngineer) {
            existing.assignedEngineer = initSample.assignedEngineer;
          }
        }
      });
      return Array.from(parsedMap.values());
    } catch (e) {
      return INITIAL_SAMPLES;
    }
  });

  const [clarifications, setClarifications] = useState(() => {
    const saved = localStorage.getItem('ntb_clarifications');
    if (!saved) return INITIAL_CLARIFICATIONS;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CLARIFICATIONS;
      const existingIds = new Set(parsed.map(c => c.id));
      const missing = INITIAL_CLARIFICATIONS.filter(c => !existingIds.has(c.id));
      return [...parsed, ...missing];
    } catch (e) {
      return INITIAL_CLARIFICATIONS;
    }
  });

  const [manuals, setManuals] = useState(() => {
    const saved = localStorage.getItem('ntb_manuals');
    if (!saved) return INITIAL_MANUALS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MANUALS;
    } catch (e) {
      return INITIAL_MANUALS;
    }
  });
  
  const [baseEngineers] = useState(INITIAL_ENGINEERS);
  const [oics] = useState(INITIAL_OICS);
  const [reportingManagers] = useState(INITIAL_REPORTING_MANAGERS);
  const [sections] = useState(INITIAL_SECTIONS);
  
  const [notifications, setNotifications] = useState([]);
  
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('ntb_logs')) || [
    { id: 1, time: new Date().toLocaleString(), text: 'System initialized and backend REST sync active.' }
  ]);

  const [backendConnected, setBackendConnected] = useState(false);

  // Auth Functions
  const getEngineerDetails = (engName) => {
    const map = {
      'Mariam Tyagi': { id: 'ENG-101', section: 'Mechanical' },
      'Harendra Singh': { id: 'ENG-102', section: 'Mechanical' },
      'Rajesh Kumar': { id: 'ENG-103', section: 'Chemical' },
      'Sunita Sharma': { id: 'ENG-104', section: 'Electrical' },
      'Dr. Vikram Patel': { id: 'ENG-105', section: 'Electronics' },
      'Ananya Deshmukh': { id: 'ENG-106', section: 'Biological' },
    };
    return map[engName] || { id: 'ENG-101', section: 'Mechanical' };
  };

  const login = (role, userDetails = {}) => {
    const name = userDetails.name || (role === 'Technical Manager' ? 'V. K. Jain' : role === 'Technical Engineer' ? selectedEngineer || 'Mariam Tyagi' : role === 'Sample Cell' ? 'Inward Officer' : role === 'Reporting Manager' ? 'S. P. Yadav' : 'System Admin');
    const engInfo = getEngineerDetails(name);

    const userObj = {
      id: userDetails.id || (role === 'Technical Engineer' ? engInfo.id : role === 'Technical Manager' ? 'TM-201' : role === 'Sample Cell' ? 'SC-101' : role === 'Reporting Manager' ? 'RM-301' : 'ADM-001'),
      name: name,
      role: role,
      avatar: userDetails.avatar || (role === 'Technical Manager' ? 'VJ' : role === 'Technical Engineer' ? 'MT' : role === 'Sample Cell' ? 'SC' : role === 'Reporting Manager' ? 'SY' : 'AD'),
      email: userDetails.email || `${role.toLowerCase().replace(/\s+/g, '')}@ntb.gov.in`,
      testingSection: role === 'Technical Engineer' ? engInfo.section : 'All Laboratories'
    };

    setIsAuthenticated(true);
    setCurrentUser(userObj);
    setSelectedRole(role);
    localStorage.setItem('ntb_auth', 'true');
    localStorage.setItem('ntb_user', JSON.stringify(userObj));
    triggerNotification(`Active Role switched to ${userObj.name} (${role})`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ntb_auth');
    localStorage.removeItem('ntb_user');
    triggerNotification('Logged out from NTB Portal session.', 'info');
  };

  // Enforce light mode on HTML root
  useEffect(() => {
    localStorage.setItem('ntb_theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  // Initial Load & Sync from Supabase DB or Fallback Backend REST API
  useEffect(() => {
    let samplesSub, clarificationsSub, logsSub;

    async function initBackendData() {
      if (isSupabaseConfigured) {
        setBackendConnected(true);
        console.log('[WorkflowContext] Supabase active. Initializing data & realtime channels...');

        const [supaSamples, supaClarifications, supaManuals, supaLogs] = await Promise.all([
          samplesService.getSamples(),
          clarificationsService.getClarifications(),
          manualsService.getManuals(),
          logsService.getLogs()
        ]);

        if (supaSamples && Array.isArray(supaSamples) && supaSamples.length > 0) {
          const existingIds = new Set(supaSamples.map(s => s.id));
          const missing = INITIAL_SAMPLES.filter(s => !existingIds.has(s.id));
          setSamples([...supaSamples, ...missing]);
        }
        if (supaClarifications && Array.isArray(supaClarifications) && supaClarifications.length > 0) {
          const existingIds = new Set(supaClarifications.map(c => c.id));
          const missing = INITIAL_CLARIFICATIONS.filter(c => !existingIds.has(c.id));
          setClarifications([...supaClarifications, ...missing]);
        }
        if (supaManuals && Array.isArray(supaManuals) && supaManuals.length > 0) {
          setManuals(supaManuals);
        }
        if (supaLogs && Array.isArray(supaLogs) && supaLogs.length > 0) {
          setLogs(supaLogs);
        }

        // Real-time Subscriptions
        samplesSub = samplesService.subscribeToSamples((payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setSamples(prev => [payload.new, ...prev.filter(s => s.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setSamples(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setSamples(prev => prev.filter(s => s.id !== payload.old.id));
          }
        });

        clarificationsSub = clarificationsService.subscribeToClarifications((payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setClarifications(prev => [payload.new, ...prev.filter(c => c.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setClarifications(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c));
          }
        });

        logsSub = logsService.subscribeToLogs((payload) => {
          if (payload.new) {
            setLogs(prev => [payload.new, ...prev.filter(l => l.id !== payload.new.id)]);
          }
        });
      } else {
        const health = await apiService.checkHealth();
        if (health && health.status === 'ok') {
          setBackendConnected(true);
          const [apiSamples, apiClarifications, apiManuals, apiLogs] = await Promise.all([
            apiService.getSamples(samples),
            apiService.getClarifications(clarifications),
            apiService.getManuals(manuals),
            apiService.getLogs(logs)
          ]);

          if (apiSamples && Array.isArray(apiSamples)) {
            const existingIds = new Set(apiSamples.map(s => s.id));
            const missing = INITIAL_SAMPLES.filter(s => !existingIds.has(s.id));
            setSamples([...apiSamples, ...missing]);
          }
          if (apiClarifications && Array.isArray(apiClarifications)) {
            const existingIds = new Set(apiClarifications.map(c => c.id));
            const missing = INITIAL_CLARIFICATIONS.filter(c => !existingIds.has(c.id));
            setClarifications([...apiClarifications, ...missing]);
          }
          if (apiManuals) setManuals(apiManuals);
          if (apiLogs) setLogs(apiLogs);
        } else {
          setBackendConnected(false);
        }
      }
    }

    initBackendData();

    return () => {
      if (samplesSub) samplesSub.unsubscribe();
      if (clarificationsSub) clarificationsSub.unsubscribe();
      if (logsSub) logsSub.unsubscribe();
    };
  }, []);

  // Sync state to local storage as backup
  useEffect(() => localStorage.setItem('ntb_samples', JSON.stringify(samples)), [samples]);
  useEffect(() => localStorage.setItem('ntb_clarifications', JSON.stringify(clarifications)), [clarifications]);
  useEffect(() => localStorage.setItem('ntb_manuals', JSON.stringify(manuals)), [manuals]);
  useEffect(() => localStorage.setItem('ntb_logs', JSON.stringify(logs)), [logs]);

  const triggerNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addLog = async (text) => {
    const logObj = { id: Date.now(), time: new Date().toLocaleString(), text };
    setLogs(prev => [logObj, ...prev]);
    if (isSupabaseConfigured) {
      await logsService.addLog(text);
    } else {
      await apiService.addLog(text);
    }
  };

  const addSample = async (sampleData) => {
    const newId = (sampleData.id && sampleData.id.trim()) ? sampleData.id.trim() : `${Math.floor(25 + Math.random() * 50)}M${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const today = new Date().toISOString().split('T')[0];
    const newSample = {
      dateReceived: today,
      forwardedOn: today,
      status: 'New Sample Received',
      quantity: sampleData.quantity || '1.001',
      priority: sampleData.priority || 'Medium',
      testingSection: sampleData.testingSection || 'Mechanical',
      testType: 'All',
      testBefore: '2 years',
      assignedEngineer: null,
      testRequestId: `TR-${Math.floor(100 + Math.random() * 900)}`,
      allocationDate: null,
      dueDate: null,
      testResults: null,
      testDate: null,
      resultStatus: 'Pending',
      verificationStatus: 'Pending Verification',
      reportNumber: null,
      reportDate: null,
      reportingManager: null,
      type: sampleData.type || 'New',
      documents: ['Inward_Challan_Doc.pdf'],
      ...sampleData,
      id: newId
    };

    setSamples(prev => [newSample, ...prev]);
    triggerNotification(`New Sample ${newId} inwarded into NTB Lab system!`, 'success');
    addLog(`Sample ${newId} (${newSample.product}) inwarded by Sample Cell.`);

    if (isSupabaseConfigured) {
      await samplesService.createSample(newSample);
    } else {
      await apiService.createSample(newSample);
    }
  };

  const allocateSample = async (sampleId, engineerName, sectionName, dueDate) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;

    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          assignedEngineer: engineerName,
          testingSection: sectionName || s.testingSection,
          allocationDate: today,
          dueDate: dueDate || '2026-03-15',
          status: 'Samples Allocated'
        };
        return updatedObj;
      }
      return s;
    }));

    triggerNotification(`Sample ${sampleId} allocated to ${engineerName}`, 'success');
    addLog(`Sample ${sampleId} allocated to ${engineerName} (${sectionName}).`);

    if (updatedObj) {
      await apiService.updateSample(sampleId, updatedObj);
    }
  };

  const acceptSample = async (sampleId) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          status: 'Pending',
          acceptedDate: today
        };
        return updatedObj;
      }
      return s;
    }));

    triggerNotification(`Sample ${sampleId} accepted into laboratory queue`, 'success');
    addLog(`Sample ${sampleId} accepted by Technical Engineer.`);
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const startTesting = async (sampleId) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = { 
          ...s, 
          status: 'Testing In Progress',
          testStartDate: s.testStartDate || today
        };
        return updatedObj;
      }
      return s;
    }));
    triggerNotification(`Testing started for ${sampleId}`, 'info');
    addLog(`Testing started for sample ${sampleId}.`);
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const submitTestResults = async (sampleId, testResults) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;

    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          testResults,
          testDate: today,
          resultStatus: 'Completed',
          verificationStatus: 'Pending Verification',
          status: 'Test Results Pending Verification'
        };
        return updatedObj;
      }
      return s;
    }));

    triggerNotification(`Test findings submitted for ${sampleId}`, 'success');
    addLog(`Test findings submitted for ${sampleId} by engineer.`);
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const verifyTestResults = async (sampleId, isApproved, remarks = '') => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          verificationStatus: isApproved ? 'Verified' : 'Returned for Correction',
          status: isApproved ? 'Reports Pending' : 'Testing In Progress',
          remarks: remarks ? `${s.remarks || ''} [Verification Note: ${remarks}]` : s.remarks
        };
        return updatedObj;
      }
      return s;
    }));

    addLog(isApproved ? `Verified test results for ${sampleId}. Transferred to Reports Pending queue.` : `Returned test results for ${sampleId} to engineer for correction.`);
    triggerNotification(isApproved ? `Sample ${sampleId} verified and transferred to Reports Pending queue!` : `Sample ${sampleId} returned to engineer for correction`, isApproved ? 'success' : 'warning');
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const approveAmendedReport = async (sampleId, remarks = '') => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          verificationStatus: 'Verified',
          status: 'Final Reports Pending',
          remarks: remarks ? `${s.remarks || ''} [Amended Report Approved: ${remarks}]` : s.remarks
        };
        return updatedObj;
      }
      return s;
    }));

    addLog(`Amended Report approved for ${sampleId}. Transferred to Final Reports queue ready for release.`);
    triggerNotification(`Amended report for ${sampleId} approved! Transferred to Final Reports`, 'success');
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const returnReportForCorrection = async (sampleId, correctionNotes = '') => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          verificationStatus: 'Returned for Correction',
          status: 'Testing In Progress',
          remarks: correctionNotes ? `${s.remarks || ''} [Returned for Correction: ${correctionNotes}]` : s.remarks
        };
        return updatedObj;
      }
      return s;
    }));

    addLog(`Report for sample ${sampleId} returned for correction. Note: ${correctionNotes}`);
    triggerNotification(`Report for ${sampleId} returned for correction`, 'warning');
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const raiseClarification = async (sampleId, subject, clarificationText, sentTo = 'Sample Cell') => {
    const newId = String(Math.floor(70000 + Math.random() * 20000));
    const newClar = {
      id: newId,
      sampleId,
      subject,
      clarification: clarificationText,
      receivedFrom: `Technical Team (${selectedEngineer})`,
      dateReceived: new Date().toISOString().split('T')[0],
      assignedEngineer: selectedEngineer,
      raisedBy: selectedEngineer,
      dateRaised: new Date().toISOString().split('T')[0],
      sentTo,
      status: 'Open',
      response: null,
      responseDate: null,
      sampleStatus: 'Testing In Progress'
    };

    setClarifications(prev => [newClar, ...prev]);
    triggerNotification(`Clarification Query #${newId} raised for Sample ${sampleId}`, 'warning');
    addLog(`Clarification #${newId} raised for ${sampleId} (${subject}).`);
    if (isSupabaseConfigured) {
      await clarificationsService.createClarification(newClar);
    } else {
      await apiService.createClarification(newClar);
    }
  };

  const respondClarification = async (clarId, responseText) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;

    setClarifications(prev => prev.map(c => {
      if (c.id === clarId) {
        updatedObj = {
          ...c,
          response: responseText,
          responseDate: today,
          status: 'Closed'
        };
        return updatedObj;
      }
      return c;
    }));

    triggerNotification(`Clarification #${clarId} resolved and closed`, 'success');
    addLog(`Clarification #${clarId} responded and closed.`);
    if (updatedObj) {
      if (isSupabaseConfigured) {
        await clarificationsService.updateClarification(clarId, updatedObj);
      } else {
        await apiService.updateClarification(clarId, updatedObj);
      }
    }
  };

  const prepareReport = async (sampleId, reportNumber, reportingManager) => {
    const today = new Date().toISOString().split('T')[0];
    let updatedObj = null;

    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = {
          ...s,
          reportNumber: reportNumber || `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          reportDate: today,
          reportingManager: reportingManager || 'S. P. Yadav',
          status: 'Final Reports Pending'
        };
        return updatedObj;
      }
      return s;
    }));

    triggerNotification(`Test report certificate prepared for ${sampleId}`, 'success');
    addLog(`Test report compiled for ${sampleId}.`);
    if (updatedObj) {
      if (isSupabaseConfigured) {
        await samplesService.updateSample(sampleId, updatedObj);
      } else {
        await apiService.updateSample(sampleId, updatedObj);
      }
    }
  };

  const sendReportToSampleCell = async (sampleId) => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = { 
          ...s, 
          status: 'Sent to Sample Cell',
          finalReportPdf: `Final_Test_Report_${s.id}.pdf`,
          dispatchedToSampleCellAt: new Date().toISOString()
        };
        return updatedObj;
      }
      return s;
    }));

    const rNum = updatedObj?.reportNumber || `REP-${sampleId}`;
    triggerNotification(`Report #${rNum} for Sample ${sampleId} transferred directly to Sample Cell`, 'success');
    addLog(`Sample Cell Return Sync Triggered: Sample ${sampleId} | Report #${rNum} | Results: "${updatedObj?.testResults || 'Passed'}" | PDF: Final_Test_Report_${sampleId}.pdf | Section: ${updatedObj?.testingSection} | Engineer: ${updatedObj?.assignedEngineer} | Manager: ${updatedObj?.reportingManager} transferred directly into Sample Cell system.`);
    if (updatedObj) {
      if (isSupabaseConfigured) {
        await samplesService.updateSample(sampleId, updatedObj);
      } else {
        await apiService.updateSample(sampleId, updatedObj);
      }
    }
  };

  const uploadUserManual = async (title, fileUrl = null) => {
    const newManual = {
      title,
      updatedBy: 'Admin',
      date: new Date().toISOString().split('T')[0],
      published: true,
      fileUrl
    };

    if (isSupabaseConfigured) {
      const created = await manualsService.createManual(newManual);
      setManuals(prev => [...prev, created || newManual]);
    } else {
      const fallbackManual = { id: manuals.length + 1, ...newManual };
      setManuals(prev => [...prev, fallbackManual]);
      await apiService.createManual(fallbackManual);
    }
    triggerNotification(`Manual uploaded: "${title}"`, 'success');
    addLog(`User Manual "${title}" published.`);
  };

  const updateUserManual = async (id, title) => {
    let updated = null;
    setManuals(prev => prev.map(m => {
      if (m.id === id) {
        updated = { ...m, title, date: new Date().toISOString().split('T')[0] };
        return updated;
      }
      return m;
    }));
    triggerNotification('Manual updated', 'info');
    if (updated) {
      if (isSupabaseConfigured) {
        await manualsService.updateManual(id, updated);
      } else {
        await apiService.updateManual(id, updated);
      }
    }
  };

  const deleteUserManual = async (id) => {
    setManuals(prev => prev.filter(m => m.id !== id));
    triggerNotification('Manual deleted', 'warning');
    if (isSupabaseConfigured) {
      await manualsService.deleteManual(id);
    } else {
      await apiService.deleteManual(id);
    }
  };

  const getFilteredSamples = (filterKey) => {
    if (!filterKey || filterKey === 'all') return samples;
    const fk = filterKey.toLowerCase();
    return samples.filter(s => {
      const st = (s.status || '').toLowerCase();
      if (fk === 'new') return st.includes('new');
      if (fk === 'testing') return st.includes('testing') || st.includes('allocated');
      if (fk === 'verification') return st.includes('verification');
      if (fk === 'reports') return st.includes('report') || st.includes('final');
      return st === fk;
    });
  };

  const [baseSeries] = useState(INITIAL_SERIES);
  const series = baseSeries.map(ser => {
    const keyword = (ser.product || '').split(' ')[0].toLowerCase();
    const linked = samples.filter(s => (s.product || '').toLowerCase().includes(keyword));
    if (linked.length === 0) return ser;
    const completed = linked.filter(s => ['Sent to Sample Cell', 'Final Reports Pending', 'Testing Completed'].includes(s.status)).length;
    const pending = Math.max(0, linked.length - completed);
    let status = ser.status;
    if (pending === 0 && completed > 0) status = 'Final Reports';
    else if (completed > 0) status = 'Pending Reports';
    else status = 'Pending Requests';
    return {
      ...ser,
      sampleCount: linked.length,
      completedReports: completed,
      pendingReports: pending,
      status
    };
  });

  const [masterData, setMasterData] = useState(() => {
    const saved = localStorage.getItem('ntb_master_data');
    if (!saved) return INITIAL_MASTER_DATA;
    try {
      const parsed = JSON.parse(saved);
      return typeof parsed === 'object' && parsed !== null ? { ...INITIAL_MASTER_DATA, ...parsed } : INITIAL_MASTER_DATA;
    } catch (e) {
      return INITIAL_MASTER_DATA;
    }
  });

  useEffect(() => localStorage.setItem('ntb_master_data', JSON.stringify(masterData)), [masterData]);

  const addMasterItem = (category, item) => {
    if (!item || !item.trim()) return;
    const cleanItem = item.trim();
    setMasterData(prev => {
      const currentList = prev[category] || [];
      if (currentList.includes(cleanItem)) return prev;
      return { ...prev, [category]: [...currentList, cleanItem] };
    });
    triggerNotification(`Added "${cleanItem}" to ${category}`, 'success');
    addLog(`Admin added master data record "${cleanItem}" under ${category}.`);
  };

  const deleteMasterItem = (category, itemToDelete) => {
    setMasterData(prev => {
      const currentList = prev[category] || [];
      return { ...prev, [category]: currentList.filter(i => i !== itemToDelete) };
    });
    triggerNotification(`Removed "${itemToDelete}" from ${category}`, 'warning');
    addLog(`Admin deleted master data record "${itemToDelete}" from ${category}.`);
  };

  const engineers = baseEngineers.map(eng => {
    const activeTasks = samples.filter(s =>
      s.assignedEngineer === eng.name &&
      !['Sent to Sample Cell', 'WITHDRAWN', 'Testing Completed'].includes(s.status)
    ).length;
    return { ...eng, activeTasks };
  });

  // Sample Cell Workflow Actions
  const [sampleRequests, setSampleRequests] = useState(() => {
    const saved = localStorage.getItem('ntb_sample_requests');
    if (!saved) return INITIAL_SAMPLE_REQUESTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_REQUESTS;
    } catch (e) {
      return INITIAL_SAMPLE_REQUESTS;
    }
  });

  useEffect(() => localStorage.setItem('ntb_sample_requests', JSON.stringify(sampleRequests)), [sampleRequests]);

  const acceptSampleCell = async (sampleId) => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = { ...s, status: 'Pending Forwarding', acceptedBySampleCellAt: new Date().toISOString() };
        return updatedObj;
      }
      return s;
    }));
    triggerNotification(`Sample ${sampleId} accepted by Sample Cell`, 'success');
    addLog(`Sample ${sampleId} accepted into Sample Cell portal.`);
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const forwardSampleCell = async (sampleId, forwardTo = 'Technical Manager') => {
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === sampleId) {
        updatedObj = { ...s, status: 'New Sample Received', forwardedTo: forwardTo, forwardedAt: new Date().toISOString() };
        return updatedObj;
      }
      return s;
    }));
    triggerNotification(`Sample ${sampleId} forwarded to ${forwardTo}`, 'success');
    addLog(`Sample ${sampleId} forwarded to ${forwardTo}.`);
    if (updatedObj) await apiService.updateSample(sampleId, updatedObj);
  };

  const generateTestRequest = async (trData) => {
    const trId = `TR-${trData.sampleId || Math.floor(1000 + Math.random() * 9000)}`;
    let updatedObj = null;
    setSamples(prev => prev.map(s => {
      if (s.id === trData.sampleId) {
        updatedObj = {
          ...s,
          testRequestId: trId,
          standard: trData.standard || s.standard,
          testingSection: trData.testingSection || s.testingSection,
          requiredTests: trData.requiredTests || s.requiredTests,
          testParameters: trData.testParameters || [],
          priority: trData.priority || s.priority,
          status: 'New Sample Received',
          remarks: trData.remarks || s.remarks
        };
        return updatedObj;
      }
      return s;
    }));
    triggerNotification(`Test Request #${trId} generated for Sample ${trData.sampleId}`, 'success');
    addLog(`Formal Test Request #${trId} generated and forwarded to Technical Manager.`);
  };

  const handleDispute = async (sampleId, reason) => {
    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: 'Disputed', is_disputed: true, isDisputed: true, dispute_status: 'OPEN', disputeStatus: 'OPEN', disputeReason: reason } : s));
    triggerNotification(`Sample ${sampleId} marked as Disputed`, 'warning');
    addLog(`Sample ${sampleId} flagged as Disputed: ${reason}`);
  };

  const resolveDispute = (sampleId) => {
    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, is_disputed: false, isDisputed: false, dispute_status: 'RESOLVED', disputeStatus: 'RESOLVED', status: 'Pending Forwarding' } : s));
    triggerNotification(`Dispute resolved for Sample ${sampleId}.`, 'success');
    addLog(`Dispute for Sample ${sampleId} marked as RESOLVED by Sample Cell.`);
  };

  const handleReturnRequest = async (sampleId, reason) => {
    const newReq = { id: `REQ-RET-${Math.floor(100 + Math.random() * 900)}`, sampleId, product: samples.find(s => s.id === sampleId)?.product || 'Sample', type: 'RETURN', requestDate: new Date().toISOString().split('T')[0], reason, status: 'PENDING', requestedBy: 'Applicant' };
    setSampleRequests(prev => [newReq, ...prev]);
    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: 'Return Requests', returnReason: reason } : s));
    triggerNotification(`Return request logged for ${sampleId}`, 'info');
    addLog(`Return request created for ${sampleId}.`);
  };

  const handleDiscardRequest = async (sampleId, reason) => {
    const newReq = { id: `REQ-DISC-${Math.floor(100 + Math.random() * 900)}`, sampleId, product: samples.find(s => s.id === sampleId)?.product || 'Sample', type: 'DISCARD', requestDate: new Date().toISOString().split('T')[0], reason, status: 'PENDING', requestedBy: 'Lab Officer' };
    setSampleRequests(prev => [newReq, ...prev]);
    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: 'Discard Requests', discardReason: reason } : s));
    triggerNotification(`Discard request logged for ${sampleId}`, 'warning');
    addLog(`Discard request logged for ${sampleId}.`);
  };

  const approveReturnRequest = (reqId) => {
    setSampleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
    triggerNotification(`Return Request #${reqId} approved! Sample returned to applicant.`, 'success');
    addLog(`Return Request #${reqId} approved by Sample Cell.`);
  };

  const rejectReturnRequest = (reqId) => {
    setSampleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
    triggerNotification(`Return Request #${reqId} rejected.`, 'warning');
    addLog(`Return Request #${reqId} rejected by Sample Cell.`);
  };

  const approveDiscardRequest = (reqId) => {
    setSampleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
    triggerNotification(`Discard Request #${reqId} approved. Remnant discarded.`, 'success');
    addLog(`Discard Request #${reqId} approved by Sample Cell.`);
  };

  const rejectDiscardRequest = (reqId) => {
    setSampleRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));
    triggerNotification(`Discard Request #${reqId} rejected.`, 'warning');
    addLog(`Discard Request #${reqId} rejected by Sample Cell.`);
  };

  const withdrawSample = async (sampleId, reason) => {
    setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: 'WITHDRAWN', withdrawalReason: reason } : s));
    triggerNotification(`Sample ${sampleId} withdrawn`, 'error');
    addLog(`Sample ${sampleId} withdrawn: ${reason}`);
  };

  return (
    <WorkflowContext.Provider value={{
      activeTab, setActiveTab,
      theme,
      backendConnected,
      isAuthenticated, login, logout, currentUser,
      samples, series, masterData, clarifications, manuals, engineers, oics, reportingManagers, sections, sampleRequests,
      selectedRole, setSelectedRole, selectedEngineer, setSelectedEngineer,
      notifications, logs,
      addSample, allocateSample, acceptSample, startTesting, submitTestResults, verifyTestResults, approveAmendedReport, returnReportForCorrection,
      acceptSampleCell, forwardSampleCell, generateTestRequest, handleDispute, resolveDispute, handleReturnRequest, handleDiscardRequest, approveReturnRequest, rejectReturnRequest, approveDiscardRequest, rejectDiscardRequest, withdrawSample,
      raiseClarification, respondClarification, prepareReport, sendReportToSampleCell,
      addMasterItem, deleteMasterItem,
      uploadUserManual, updateUserManual, deleteUserManual, getFilteredSamples, triggerNotification, addLog
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => useContext(WorkflowContext);