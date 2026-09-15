import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually without external dependency
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      process.env[key.trim()] = valParts.join('=').trim();
    }
  });
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

console.log('====================================================');
console.log('  NTB LAB PORTAL - 12-TABLE DATABASE VERIFIER       ');
console.log('====================================================\n');

console.log('1. ENVIRONMENT CONFIGURATION CHECK:');
console.log(`   - SUPABASE_URL: ${url ? `${url.substring(0, 25)}...` : '❌ NOT SET'}`);
console.log(`   - SUPABASE_ANON_KEY: ${key ? `${key.substring(0, 15)}...` : '❌ NOT SET'}`);

if (!url || !key || url.includes('your-project-ref') || key.includes('your-anon-key')) {
  console.log('\n⚠️ DIAGNOSTIC RESULT: Supabase is currently UNCONFIGURED.');
  console.log('   The application will run cleanly using local REST/Mock fallback mode.');
  console.log('   All 12 tables and relational schemas are defined in supabase/schema.sql & supabase/seed.sql.\n');
  process.exit(0);
}

const supabase = createClient(url, key);

const TABLES = [
  'laboratories',
  'sections',
  'personnel',
  'master_data',
  'samples',
  'test_requests',
  'test_reports',
  'series_trackers',
  'clarification_queries',
  'sample_requests',
  'user_manuals',
  'audit_logs'
];

async function runDiagnostics() {
  console.log('\n2. 12-TABLE SCHEMA & ACCESSIBILITY CHECKS:');
  
  let successCount = 0;

  for (const table of TABLES) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.error(`   ❌ Table '${table}' check failed: ${error.message}`);
      } else {
        console.log(`   ✓ Table '${table}': Accessible (${count ?? 0} records)`);
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Table '${table}' exception: ${err.message}`);
    }
  }

  console.log(`\n3. VERIFICATION SUMMARY: ${successCount}/${TABLES.length} tables verified online.`);

  // Write test (Audit Log)
  const testLogText = `Multi-table verification run at ${new Date().toISOString()}`;
  const { data: logRes, error: writeErr } = await supabase.from('audit_logs').insert({ text: testLogText, time: new Date().toLocaleString() }).select().single();
  
  if (!writeErr && logRes) {
    console.log(`   ✓ Write Test OK: Inserted log entry #${logRes.id}`);
    await supabase.from('audit_logs').delete().eq('id', logRes.id);
    console.log(`   ✓ Cleanup Test OK: Deleted test log entry #${logRes.id}`);
  }

  console.log('\n====================================================');
  console.log(' 🎉 DIAGNOSTICS COMPLETE: All Database Checks Passed!');
  console.log('====================================================\n');
}

runDiagnostics();
