import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const PORT = process.env.PORT || 5000;

// Read JSON database helper
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { samples: [], clarifications: [], manuals: [], engineers: [], oics: [], sections: [], logs: [] };
  }
}

// Write JSON database helper
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Enable CORS and JSON Content-Type headers
function setHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

// Parse request body JSON
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  setHeaders(res);

  // Handle CORS preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    const db = readDB();

    // 1. Health check
    if (pathname === '/api/health' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), totalSamples: db.samples.length }));
      return;
    }

    // 1b. Auth login endpoint
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await getRequestBody(req);
      const role = body.role || 'Technical Manager';
      res.writeHead(200);
      res.end(JSON.stringify({
        authenticated: true,
        token: `ntb_token_${Date.now()}`,
        role,
        email: body.email || '',
        timestamp: Date.now()
      }));
      return;
    }

    // 2. Samples API
    if (pathname === '/api/samples') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(db.samples));
        return;
      }
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newSample = {
          id: body.id || `${Math.floor(25 + Math.random() * 50)}M${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          dateReceived: body.dateReceived || new Date().toISOString().split('T')[0],
          status: body.status || 'New Sample Received',
          quantity: body.quantity || '1.00',
          priority: body.priority || 'Medium',
          testingSection: body.testingSection || 'Mechanical',
          type: body.type || 'New',
          documents: ['Inward_Challan_Doc.pdf'],
          ...body
        };
        db.samples.unshift(newSample);
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `New sample ${newSample.id} (${newSample.product}) added via API.` });
        writeDB(db);
        res.writeHead(201);
        res.end(JSON.stringify(newSample));
        return;
      }
    }

    // Workflow status transition endpoint
    if (pathname === '/api/samples/transition' && method === 'POST') {
      const body = await getRequestBody(req);
      const { sampleId, status, extraFields = {} } = body;
      const idx = db.samples.findIndex(s => s.id === sampleId);
      if (idx !== -1) {
        db.samples[idx] = { ...db.samples[idx], status, ...extraFields };
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Sample ${sampleId} transitioned to '${status}'.` });
        writeDB(db);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, sample: db.samples[idx] }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Sample ${sampleId} not found` }));
      }
      return;
    }

    // Generate test request endpoint
    if (pathname === '/api/test-requests/generate' && method === 'POST') {
      const body = await getRequestBody(req);
      const sampleId = body.sampleId || `${Math.floor(25 + Math.random() * 50)}M${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const newSample = {
        id: sampleId,
        product: body.product || 'Sample Product',
        sampleType: body.sampleType || 'General',
        standard: body.standard || 'IS 4246 (2025)',
        testType: body.testType || 'All',
        testingSection: body.testingSection || 'Mechanical',
        priority: body.priority || 'Medium',
        dateReceived: new Date().toISOString().split('T')[0],
        status: 'New Sample Received',
        type: 'New Request',
        ...body
      };
      db.samples.unshift(newSample);
      db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Test Request generated for ${newSample.product} (${sampleId}).` });
      writeDB(db);
      res.writeHead(201);
      res.end(JSON.stringify(newSample));
      return;
    }

    // Sample detail & update routes `/api/samples/:id`
    if (pathname.startsWith('/api/samples/')) {
      const sampleId = pathname.replace('/api/samples/', '');
      const idx = db.samples.findIndex(s => s.id === sampleId);

      if (idx === -1) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: `Sample ${sampleId} not found` }));
        return;
      }

      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(db.samples[idx]));
        return;
      }

      if (method === 'PUT') {
        const body = await getRequestBody(req);
        db.samples[idx] = { ...db.samples[idx], ...body };
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Sample ${sampleId} updated (Status: ${db.samples[idx].status}).` });
        writeDB(db);
        res.writeHead(200);
        res.end(JSON.stringify(db.samples[idx]));
        return;
      }

      if (method === 'DELETE') {
        const removed = db.samples.splice(idx, 1);
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Sample ${sampleId} deleted via API.` });
        writeDB(db);
        res.writeHead(200);
        res.end(JSON.stringify(removed[0]));
        return;
      }
    }

    // 3. Clarifications API
    if (pathname === '/api/clarifications') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(db.clarifications));
        return;
      }
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newClar = {
          id: body.id || String(Math.floor(70000 + Math.random() * 20000)),
          dateRaised: new Date().toISOString().split('T')[0],
          status: 'Open',
          sentTo: 'Sample Cell',
          ...body
        };
        db.clarifications.unshift(newClar);
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Clarification #${newClar.id} raised for ${newClar.sampleId}.` });
        writeDB(db);
        res.writeHead(201);
        res.end(JSON.stringify(newClar));
        return;
      }
    }

    if (pathname.startsWith('/api/clarifications/')) {
      const clarId = pathname.replace('/api/clarifications/', '');
      const idx = db.clarifications.findIndex(c => c.id === clarId);
      if (idx !== -1 && method === 'PUT') {
        const body = await getRequestBody(req);
        db.clarifications[idx] = { ...db.clarifications[idx], ...body };
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `Clarification #${clarId} updated.` });
        writeDB(db);
        res.writeHead(200);
        res.end(JSON.stringify(db.clarifications[idx]));
        return;
      }
    }

    // 4. User Manuals API
    if (pathname === '/api/manuals') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(db.manuals));
        return;
      }
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newManual = {
          id: db.manuals.length + 1,
          title: body.title,
          updatedBy: 'Admin',
          date: new Date().toISOString().split('T')[0],
          published: true,
          ...body
        };
        db.manuals.push(newManual);
        db.logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), text: `User Manual "${newManual.title}" uploaded.` });
        writeDB(db);
        res.writeHead(201);
        res.end(JSON.stringify(newManual));
        return;
      }
    }

    if (pathname.startsWith('/api/manuals/')) {
      const manualId = parseInt(pathname.replace('/api/manuals/', ''), 10);
      const idx = db.manuals.findIndex(m => m.id === manualId);
      if (idx !== -1) {
        if (method === 'PUT') {
          const body = await getRequestBody(req);
          db.manuals[idx] = { ...db.manuals[idx], ...body };
          writeDB(db);
          res.writeHead(200);
          res.end(JSON.stringify(db.manuals[idx]));
          return;
        }
        if (method === 'DELETE') {
          const removed = db.manuals.splice(idx, 1);
          writeDB(db);
          res.writeHead(200);
          res.end(JSON.stringify(removed[0]));
          return;
        }
      }
    }

    // 5. Metadata endpoints (engineers, OICs, logs)
    if (pathname === '/api/engineers' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(db.engineers));
      return;
    }
    if (pathname === '/api/oics' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(db.oics));
      return;
    }
    if (pathname === '/api/logs') {
      if (method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(db.logs));
        return;
      }
      if (method === 'POST') {
        const body = await getRequestBody(req);
        const newLog = { id: Date.now(), time: new Date().toLocaleString(), text: body.text || 'Action logged.' };
        db.logs.unshift(newLog);
        writeDB(db);
        res.writeHead(201);
        res.end(JSON.stringify(newLog));
        return;
      }
    }

    // 404 Route Not Found
    res.writeHead(404);
    res.end(JSON.stringify({ error: `Route ${method} ${pathname} not found` }));
  } catch (err) {
    console.error('Server Handler Error:', err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 NTB REST API Backend running on http://localhost:${PORT}`);
});
