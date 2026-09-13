#!/usr/bin/env python3
import http.server
import json
import os
import re
import socket
import sys
import time
from urllib.parse import urlsplit, parse_qs

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHAR_DIR = os.path.join(BASE_DIR, "characters")
LEGACY_FILE = os.path.join(BASE_DIR, "character-data.json")
ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
WAIT_TIMEOUT = 55
POLL_INTERVAL = 0.5


def char_path(char_id):
    return os.path.join(CHAR_DIR, char_id + ".json")


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        if path == "/api/characters":
            self.handle_list_characters()
            return
        if path.startswith("/api/character/") and path.endswith("/wait"):
            char_id = path[len("/api/character/"):-len("/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_character(char_id, since)
            return
        if path.startswith("/api/character/"):
            char_id = path[len("/api/character/"):]
            self.handle_get_character(char_id)
            return
        if path in ("/", ""):
            self.path = "/character-ledger.html"
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/character/"):
            char_id = self.path[len("/api/character/"):]
            self.handle_post_character(char_id)
            return
        self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith("/api/character/"):
            char_id = self.path[len("/api/character/"):]
            self.handle_delete_character(char_id)
            return
        self.send_error(404)

    def handle_list_characters(self):
        items = []
        if os.path.isdir(CHAR_DIR):
            for fname in os.listdir(CHAR_DIR):
                if not fname.endswith(".json"):
                    continue
                char_id = fname[:-5]
                full = os.path.join(CHAR_DIR, fname)
                meta = {}
                try:
                    with open(full, "r", encoding="utf-8") as f:
                        parsed = json.load(f)
                    meta = (parsed or {}).get("meta") or {}
                except Exception:
                    pass
                items.append({
                    "id": char_id,
                    "name": meta.get("name", ""),
                    "meta": meta,
                    "updatedAt": os.path.getmtime(full)
                })
        items.sort(key=lambda c: c["updatedAt"], reverse=True)
        self.write_json(200, items)

    def handle_get_character(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = char_path(char_id)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body, updated_at=os.path.getmtime(path))
        else:
            self.write_raw_json(200, "{}", updated_at=0)

    def handle_wait_character(self, char_id, since):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = char_path(char_id)
        deadline = time.time() + WAIT_TIMEOUT
        while True:
            mtime = os.path.getmtime(path) if os.path.exists(path) else 0
            if mtime > since:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        body = f.read()
                else:
                    body = "{}"
                self.write_raw_json(200, body, updated_at=mtime)
                return
            if time.time() >= deadline:
                self.send_response(204)
                self.send_header("Cache-Control", "no-store")
                self.send_header("X-Updated-At", str(mtime))
                self.end_headers()
                return
            time.sleep(POLL_INTERVAL)

    def handle_post_character(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            parsed = json.loads(raw.decode("utf-8"))
        except Exception:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(CHAR_DIR, exist_ok=True)
        path = char_path(char_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2)
        self.write_json(200, {"ok": True, "updatedAt": os.path.getmtime(path)})

    def handle_delete_character(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = char_path(char_id)
        if os.path.exists(path):
            os.remove(path)
        self.write_json(200, {"ok": True})

    def write_json(self, status, obj):
        self.write_raw_json(status, json.dumps(obj))

    def write_raw_json(self, status, body_str, updated_at=None):
        data = body_str.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        if updated_at is not None:
            self.send_header("X-Updated-At", str(updated_at))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def migrate_legacy_file():
    os.makedirs(CHAR_DIR, exist_ok=True)
    default_path = char_path("default")
    if os.path.exists(LEGACY_FILE) and not os.path.exists(default_path):
        os.replace(LEGACY_FILE, default_path)
        print("Migrated character-data.json into characters/default.json")


def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def main():
    os.chdir(BASE_DIR)
    migrate_legacy_file()
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    ip = local_ip()
    print("Character Ledger server running.")
    print("On this PC:      http://localhost:%d" % PORT)
    print("On your tablet:  http://%s:%d" % (ip, PORT))
    print("Characters saved in: %s" % CHAR_DIR)
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        server.shutdown()


if __name__ == "__main__":
    main()
