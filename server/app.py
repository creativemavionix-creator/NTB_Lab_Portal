from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import sys
from supabase_db import DatabaseManager, supabase_client

# Force UTF-8 encoding for Windows console print
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)  # Enable CORS for Vite frontend on port 5173

# ==================== REST API ENDPOINTS ====================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "backend": "python",
        "framework": "Flask 3.0",
        "supabase": "connected" if supabase_client is not None else "fallback_local",
        "timestamp": time.time()
    })

# --- AUTHENTICATION ENDPOINT ---
@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json() or {}
    role = data.get("role", "Technical Manager")
    email = data.get("email", "")
    
    role_passwords = {
        "Technical Manager": "Manager@ntb2026",
        "Technical Engineer": "Engineer@ntb2026",
        "Sample Cell": "SampleCell@ntb2026",
        "Reporting Manager": "ReportManager@ntb2026",
        "Admin": "Admin@ntb2026"
    }

    user_payload = {
        "authenticated": True,
        "token": f"ntb_token_{int(time.time())}",
        "role": role,
        "email": email,
        "expectedPassword": role_passwords.get(role, "Admin@ntb2026"),
        "timestamp": time.time()
    }
    return jsonify(user_payload)

# --- SAMPLES ENDPOINTS ---
@app.route("/api/samples", methods=["GET"])
def get_samples():
    samples = DatabaseManager.get_samples()
    return jsonify(samples)

@app.route("/api/samples", methods=["POST"])
def create_sample():
    data = request.get_json() or {}
    created = DatabaseManager.create_sample(data)
    return jsonify(created), 201

@app.route("/api/samples/<sample_id>", methods=["PUT"])
def update_sample(sample_id):
    data = request.get_json() or {}
    updated = DatabaseManager.update_sample(sample_id, data)
    return jsonify(updated)

@app.route("/api/samples/<sample_id>", methods=["DELETE"])
def delete_sample(sample_id):
    res = DatabaseManager.delete_sample(sample_id)
    return jsonify(res)

# --- WORKFLOW STATUS TRANSITION ENDPOINT ---
@app.route("/api/samples/transition", methods=["POST"])
def transition_sample_status():
    data = request.get_json() or {}
    sample_id = data.get("sampleId")
    new_status = data.get("status")
    extra_fields = data.get("extraFields", {})

    if not sample_id or not new_status:
        return jsonify({"error": "Missing sampleId or status"}), 400

    update_payload = {"status": new_status, **extra_fields}
    updated = DatabaseManager.update_sample(sample_id, update_payload)

    # Log action in audit trail
    log_text = f"Sample {sample_id} status updated to '{new_status}'."
    log_item = {
        "id": int(time.time() * 1000),
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "text": log_text
    }
    DatabaseManager.add_log(log_item)

    return jsonify({"success": True, "sample": updated})

# --- TEST REQUEST GENERATION ENDPOINT ---
@app.route("/api/test-requests/generate", methods=["POST"])
def generate_test_request():
    data = request.get_json() or {}
    sample_id = data.get("sampleId") or f"{int(time.time())}"
    
    test_request_data = {
        "id": sample_id,
        "product": data.get("product", "Sample Product"),
        "sampleType": data.get("sampleType", "General"),
        "standard": data.get("standard", "IS 4246 (2025)"),
        "testType": data.get("testType", "All"),
        "testParameters": data.get("testParameters", "All Parameters"),
        "testingSection": data.get("testingSection", "Mechanical"),
        "priority": data.get("priority", "Medium"),
        "dateReceived": time.strftime("%Y-%m-%d"),
        "requiredDate": data.get("requiredDate", "2026-03-30"),
        "remarks": data.get("remarks", "Test request generated"),
        "status": "New Sample Received",
        "type": "New Request"
    }

    created = DatabaseManager.create_sample(test_request_data)
    
    # Log action
    log_item = {
        "id": int(time.time() * 1000),
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "text": f"Test Request generated for {test_request_data['product']} (ID: {sample_id})."
    }
    DatabaseManager.add_log(log_item)

    return jsonify(created), 201

# --- CLARIFICATIONS ENDPOINTS ---
@app.route("/api/clarifications", methods=["GET"])
def get_clarifications():
    clarifications = DatabaseManager.get_clarifications()
    return jsonify(clarifications)

@app.route("/api/clarifications", methods=["POST"])
def create_clarification():
    data = request.get_json() or {}
    created = DatabaseManager.create_clarification(data)
    return jsonify(created), 201

@app.route("/api/clarifications/<clar_id>", methods=["PUT"])
def update_clarification(clar_id):
    data = request.get_json() or {}
    updated = DatabaseManager.update_clarification(clar_id, data)
    return jsonify(updated)

# --- MANUALS ENDPOINTS ---
@app.route("/api/manuals", methods=["GET"])
def get_manuals():
    manuals = DatabaseManager.get_manuals()
    return jsonify(manuals)

@app.route("/api/manuals", methods=["POST"])
def create_manual():
    data = request.get_json() or {}
    created = DatabaseManager.create_manual(data)
    return jsonify(created), 201

@app.route("/api/manuals/<manual_id>", methods=["PUT"])
def update_manual(manual_id):
    data = request.get_json() or {}
    updated = DatabaseManager.update_manual(manual_id, data)
    return jsonify(updated)

@app.route("/api/manuals/<manual_id>", methods=["DELETE"])
def delete_manual(manual_id):
    res = DatabaseManager.delete_manual(manual_id)
    return jsonify(res)

# --- AUDIT LOGS ENDPOINTS ---
@app.route("/api/logs", methods=["GET"])
def get_logs():
    logs = DatabaseManager.get_logs()
    return jsonify(logs)

@app.route("/api/logs", methods=["POST"])
def add_log():
    data = request.get_json() or {}
    log_text = data.get("text", "")
    log_item = {
        "id": int(time.time() * 1000),
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "text": log_text
    }
    created = DatabaseManager.add_log(log_item)
    return jsonify(created), 201

# --- MASTER DATA & METADATA ENDPOINTS ---
@app.route("/api/engineers", methods=["GET"])
def get_engineers():
    return jsonify(DatabaseManager.get_engineers())

@app.route("/api/oics", methods=["GET"])
def get_oics():
    return jsonify(DatabaseManager.get_oics())

@app.route("/api/reporting-managers", methods=["GET"])
def get_reporting_managers():
    return jsonify(DatabaseManager.get_reporting_managers())

@app.route("/api/sections", methods=["GET"])
def get_sections():
    return jsonify(DatabaseManager.get_sections())

# --- SERIES ENDPOINTS ---
@app.route("/api/series", methods=["GET"])
def get_series():
    return jsonify(DatabaseManager.get_series())

@app.route("/api/series", methods=["POST"])
def create_series():
    data = request.get_json() or {}
    created = DatabaseManager.create_series(data)
    return jsonify(created), 201

@app.route("/api/series/<series_id>", methods=["PUT"])
def update_series(series_id):
    data = request.get_json() or {}
    updated = DatabaseManager.update_series(series_id, data)
    return jsonify(updated)

# --- MASTER DATA CONFIG ENDPOINTS ---
@app.route("/api/master-data", methods=["GET"])
def get_master_data():
    return jsonify(DatabaseManager.get_master_data())

@app.route("/api/master-data", methods=["POST"])
def add_master_item():
    data = request.get_json() or {}
    category = data.get("category")
    item = data.get("item")
    updated = DatabaseManager.add_master_item(category, item)
    return jsonify(updated)

@app.route("/api/master-data", methods=["DELETE"])
def delete_master_item():
    data = request.get_json() or {}
    category = data.get("category")
    item = data.get("item")
    updated = DatabaseManager.delete_master_item(category, item)
    return jsonify(updated)

# --- SAMPLE REQUESTS ENDPOINTS ---
@app.route("/api/sample-requests", methods=["GET"])
def get_sample_requests():
    return jsonify(DatabaseManager.get_sample_requests())

@app.route("/api/sample-requests", methods=["POST"])
def create_sample_request():
    data = request.get_json() or {}
    created = DatabaseManager.create_sample_request(data)
    return jsonify(created), 201

@app.route("/api/sample-requests/<req_id>", methods=["PUT"])
def update_sample_request(req_id):
    data = request.get_json() or {}
    updated = DatabaseManager.update_sample_request(req_id, data)
    return jsonify(updated)



if __name__ == "__main__":
    print("==================================================")
    print("[NTB Dashboard] Python REST API Backend Running!")
    print("[NTB Dashboard] URL: http://localhost:5000/api")
    print("[NTB Dashboard] Supabase Status:", "Connected" if supabase_client else "Offline Fallback Local DB")
    print("==================================================")
    app.run(host="0.0.0.0", port=5000, debug=False)
