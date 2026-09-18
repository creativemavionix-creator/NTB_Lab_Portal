import os
import json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY", "")

DB_FILE = Path(__file__).parent / "data" / "db.json"

# Initialize Supabase Client if credentials are provided
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[Supabase DB] Connected to Supabase project: {SUPABASE_URL}")
    except Exception as e:
        print(f"[Supabase DB] Supabase initialization warning: {e}")

def load_local_db():
    if not DB_FILE.exists():
        return {
            "samples": [],
            "clarifications": [],
            "manuals": [],
            "engineers": [],
            "oics": [],
            "reportingManagers": [],
            "logs": []
        }
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_local_db(data):
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

class DatabaseManager:
    """
    Unified Database Manager interfacing with Supabase DB tables
    with automatic fallback to local JSON database.
    """
    @staticmethod
    def get_samples():
        if supabase_client:
            try:
                res = supabase_client.table("samples").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase DB] get_samples fallback: {e}")
        db = load_local_db()
        return db.get("samples", [])

    @staticmethod
    def create_sample(sample_data):
        if supabase_client:
            try:
                res = supabase_client.table("samples").insert(sample_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] create_sample fallback: {e}")
        db = load_local_db()
        db["samples"] = [s for s in db.get("samples", []) if s.get("id") != sample_data.get("id")]
        db["samples"].insert(0, sample_data)
        save_local_db(db)
        return sample_data

    @staticmethod
    def update_sample(sample_id, update_data):
        if supabase_client:
            try:
                res = supabase_client.table("samples").update(update_data).eq("id", sample_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] update_sample fallback: {e}")
        db = load_local_db()
        updated = None
        for i, s in enumerate(db.get("samples", [])):
            if s.get("id") == sample_id:
                db["samples"][i] = {**s, **update_data}
                updated = db["samples"][i]
                break
        save_local_db(db)
        return updated or update_data

    @staticmethod
    def delete_sample(sample_id):
        if supabase_client:
            try:
                supabase_client.table("samples").delete().eq("id", sample_id).execute()
            except Exception as e:
                print(f"[Supabase DB] delete_sample fallback: {e}")
        db = load_local_db()
        db["samples"] = [s for s in db.get("samples", []) if s.get("id") != sample_id]
        save_local_db(db)
        return {"id": sample_id}

    @staticmethod
    def get_clarifications():
        if supabase_client:
            try:
                res = supabase_client.table("clarifications").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase DB] get_clarifications fallback: {e}")
        db = load_local_db()
        return db.get("clarifications", [])

    @staticmethod
    def create_clarification(clar_data):
        if supabase_client:
            try:
                res = supabase_client.table("clarifications").insert(clar_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] create_clarification fallback: {e}")
        db = load_local_db()
        db["clarifications"].insert(0, clar_data)
        save_local_db(db)
        return clar_data

    @staticmethod
    def update_clarification(clar_id, update_data):
        if supabase_client:
            try:
                res = supabase_client.table("clarifications").update(update_data).eq("id", clar_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] update_clarification fallback: {e}")
        db = load_local_db()
        updated = None
        for i, c in enumerate(db.get("clarifications", [])):
            if str(c.get("id")) == str(clar_id):
                db["clarifications"][i] = {**c, **update_data}
                updated = db["clarifications"][i]
                break
        save_local_db(db)
        return updated or update_data

    @staticmethod
    def get_manuals():
        if supabase_client:
            try:
                res = supabase_client.table("manuals").select("*").execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase DB] get_manuals fallback: {e}")
        db = load_local_db()
        return db.get("manuals", [])

    @staticmethod
    def create_manual(manual_data):
        if supabase_client:
            try:
                res = supabase_client.table("manuals").insert(manual_data).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] create_manual fallback: {e}")
        db = load_local_db()
        db["manuals"].append(manual_data)
        save_local_db(db)
        return manual_data

    @staticmethod
    def update_manual(manual_id, update_data):
        if supabase_client:
            try:
                res = supabase_client.table("manuals").update(update_data).eq("id", manual_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] update_manual fallback: {e}")
        db = load_local_db()
        updated = None
        for i, m in enumerate(db.get("manuals", [])):
            if str(m.get("id")) == str(manual_id):
                db["manuals"][i] = {**m, **update_data}
                updated = db["manuals"][i]
                break
        save_local_db(db)
        return updated or update_data

    @staticmethod
    def delete_manual(manual_id):
        if supabase_client:
            try:
                supabase_client.table("manuals").delete().eq("id", manual_id).execute()
            except Exception as e:
                print(f"[Supabase DB] delete_manual fallback: {e}")
        db = load_local_db()
        db["manuals"] = [m for m in db.get("manuals", []) if str(m.get("id")) != str(manual_id)]
        save_local_db(db)
        return {"id": manual_id}

    @staticmethod
    def get_logs():
        if supabase_client:
            try:
                res = supabase_client.table("logs").select("*").order("id", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[Supabase DB] get_logs fallback: {e}")
        db = load_local_db()
        return db.get("logs", [])

    @staticmethod
    def add_log(log_item):
        if supabase_client:
            try:
                res = supabase_client.table("logs").insert(log_item).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase DB] add_log fallback: {e}")
        db = load_local_db()
        db["logs"].insert(0, log_item)
        save_local_db(db)
        return log_item

    @staticmethod
    def get_engineers():
        db = load_local_db()
        return db.get("engineers", [])

    @staticmethod
    def get_oics():
        db = load_local_db()
        return db.get("oics", [])

    @staticmethod
    def get_reporting_managers():
        db = load_local_db()
        return db.get("reportingManagers", [])

    @staticmethod
    def get_sections():
        db = load_local_db()
        return db.get("sections", [])

    @staticmethod
    def get_series():
        db = load_local_db()
        return db.get("series", [])

    @staticmethod
    def create_series(series_data):
        db = load_local_db()
        if "series" not in db:
            db["series"] = []
        db["series"].insert(0, series_data)
        save_local_db(db)
        return series_data

    @staticmethod
    def update_series(series_id, update_data):
        db = load_local_db()
        updated = None
        for i, s in enumerate(db.get("series", [])):
            if s.get("id") == series_id:
                db["series"][i] = {**s, **update_data}
                updated = db["series"][i]
                break
        save_local_db(db)
        return updated or update_data

    @staticmethod
    def get_master_data():
        db = load_local_db()
        return db.get("masterData", {})

    @staticmethod
    def add_master_item(category, item):
        db = load_local_db()
        if "masterData" not in db:
            db["masterData"] = {}
        if category not in db["masterData"]:
            db["masterData"][category] = []
        if item not in db["masterData"][category]:
            db["masterData"][category].append(item)
            save_local_db(db)
        return db["masterData"]

    @staticmethod
    def delete_master_item(category, item):
        db = load_local_db()
        if "masterData" in db and category in db["masterData"]:
            db["masterData"][category] = [i for i in db["masterData"][category] if i != item]
            save_local_db(db)
        return db.get("masterData", {})

    @staticmethod
    def get_sample_requests():
        db = load_local_db()
        return db.get("sampleRequests", [])

    @staticmethod
    def create_sample_request(req_data):
        db = load_local_db()
        if "sampleRequests" not in db:
            db["sampleRequests"] = []
        db["sampleRequests"].insert(0, req_data)
        save_local_db(db)
        return req_data

    @staticmethod
    def update_sample_request(req_id, update_data):
        db = load_local_db()
        updated = None
        for i, r in enumerate(db.get("sampleRequests", [])):
            if r.get("id") == req_id:
                db["sampleRequests"][i] = {**r, **update_data}
                updated = db["sampleRequests"][i]
                break
        save_local_db(db)
        return updated or update_data

