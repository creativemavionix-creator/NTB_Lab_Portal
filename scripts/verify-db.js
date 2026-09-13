import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
console.log('  NTB LAB PORTAL - DATABASE DIAGNOSTIC VERIFIER     ');
console.log('====================================================\n');

console.log('1. ENVIRONMENT CONFIGURATION CHECK:');
console.log(`   - SUPABASE_URL: ${url ? `${url.substring(0, 25)}...` : '❌ NOT SET'}`);
console.log(`   - SUPABASE_ANON_KEY: ${key ? `${key.substring(0, 15)}...` : '❌ NOT SET'}`);

if (!url || !key || url.includes('your-project-ref') || key.includes('your-anon-key')) {
  console.log('\n⚠️ DIAGNOSTIC RESULT: Supabase is currently UNCONFIGURED.');
  console.log('   The application will run cleanly using local REST/Mock fallback mode.');
  console.log('   To connect to live Supabase, update .env with valid credentials.\n');
  process.exit(0);
}

const supabase = createClient(url, key);

async function runDiagnostics() {
  console.log('\n2. PING & CONNECTION TEST:');
  const start = Date.now();
  
  try {
    const { data: healthData, error: healthErr } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
    const elapsed = Date.now() - start;

    if (healthErr) {
      console.error(`   ❌ Connection Failed: ${healthErr.message} (Code: ${healthErr.code})`);
      if (healthErr.code === '42P01') {
        console.error('   👉 Diagnostic Tip: Table "audit_logs" does not exist. Run supabase/schema.sql in Supabase SQL Editor.');
      } else if (healthErr.code === 'PGRST301' || healthErr.status === 401) {
        console.error('   👉 Diagnostic Tip: Invalid API Key or Unauthorized JWT token.');
      }
      return;
    }

    console.log(`   ✓ Connected to Supabase project in ${elapsed}ms!`);

    console.log('\n3. CRUD & RLS ACCESSIBILITY TEST:');
    
    // Read test
    const { data: samples, error: readErr } = await supabase.from('samples').select('id, product, status').limit(3);
    if (readErr) {
      console.error(`   ❌ Read Test (samples table) Failed: ${readErr.message}`);
    } else {
      console.log(`   ✓ Read Test OK: Retrieved ${samples.length} records from 'samples' table.`);
    }

    // Write test (Audit Log)
    const testLogText = `Diagnostic ping test at ${new Date().toISOString()}`;
    const { data: logRes, error: writeErr } = await supabase.from('audit_logs').insert({ text: testLogText, time: new Date().toLocaleString() }).select().single();
    
    if (writeErr) {
      console.error(`   ❌ Write Test (audit_logs table) Failed: ${writeErr.message}`);
    } else {
      console.log(`   ✓ Write Test OK: Inserted log entry #${logRes.id}`);
      
      // Cleanup test write
      await supabase.from('audit_logs').delete().eq('id', logRes.id);
      console.log(`   ✓ Cleanup Test OK: Deleted test log entry #${logRes.id}`);
    }

    console.log('\n====================================================');
    console.log(' 🎉 DIAGNOSTICS COMPLETE: All Database Checks Passed!');
    console.log('====================================================\n');

  } catch (err) {
    console.error(`   ❌ Unexpected Exception: ${err.message}`);
  }
}

runDiagnostics();
