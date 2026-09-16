#!/usr/bin/env python3
import hashlib
import http.server
import json
import os
import re
import secrets
import socket
import sys
import threading
import time
from urllib.parse import urlsplit, parse_qs

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHAR_DIR = os.path.join(BASE_DIR, "characters")
TRASH_DIR = os.path.join(BASE_DIR, "trash")
CAMPAIGN_DIR = os.path.join(BASE_DIR, "campaigns")
DM_NOTES_DIR = os.path.join(BASE_DIR, "dm-notes")
DM_STATBLOCKS_DIR = os.path.join(BASE_DIR, "dm-statblocks")
DM_TREASURE_DIR = os.path.join(BASE_DIR, "dm-treasure")
DM_BOARD_MAP_DIR = os.path.join(BASE_DIR, "dm-board-map")
DM_BOARD_TOKENS_DIR = os.path.join(BASE_DIR, "dm-board-tokens")
DM_BOARD_SHAPES_DIR = os.path.join(BASE_DIR, "dm-board-shapes")
DM_AUTH_DIR = os.path.join(BASE_DIR, "dm-auth")
INBOX_DIR = os.path.join(BASE_DIR, "inbox")
CAMPAIGNS_REGISTRY_FILE = os.path.join(BASE_DIR, "campaigns-registry.json")
LEGACY_FILE = os.path.join(BASE_DIR, "character-data.json")
ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
CAMPAIGN_SLUG_RE = re.compile(r"^[a-z0-9-]{1,64}$")
WAIT_TIMEOUT = 20
POLL_INTERVAL = 0.5
LOOPBACK_ADDRS = ("127.0.0.1", "::1")

dm_tokens = {}
board_shapes_lock = threading.Lock()


def load_persisted_dm_tokens():
    if not os.path.isdir(DM_AUTH_DIR):
        return
    for fname in os.listdir(DM_AUTH_DIR):
        if not fname.endswith(".json"):
            continue
        slug = fname[:-len(".json")]
        try:
            with open(os.path.join(DM_AUTH_DIR, fname), "r", encoding="utf-8") as f:
                stored = json.load(f)
        except Exception:
            continue
        for token in stored.get("tokens") or []:
            dm_tokens[token] = slug


def char_path(char_id):
    return os.path.join(CHAR_DIR, char_id + ".json")


def dm_auth_path(slug):
    return os.path.join(DM_AUTH_DIR, slug + ".json")


def trash_path(char_id):
    return os.path.join(TRASH_DIR, char_id + ".json")


def campaign_path(slug):
    return os.path.join(CAMPAIGN_DIR, slug + ".json")


def dm_notes_path(slug):
    return os.path.join(DM_NOTES_DIR, slug + ".json")


def dm_statblocks_path(slug):
    return os.path.join(DM_STATBLOCKS_DIR, slug + ".json")


def dm_treasure_path(slug):
    return os.path.join(DM_TREASURE_DIR, slug + ".json")


def dm_board_map_path(slug):
    return os.path.join(DM_BOARD_MAP_DIR, slug + ".json")


def dm_board_tokens_path(slug):
    return os.path.join(DM_BOARD_TOKENS_DIR, slug + ".json")


def dm_board_shapes_path(slug):
    return os.path.join(DM_BOARD_SHAPES_DIR, slug + ".json")


def inbox_path(char_id):
    return os.path.join(INBOX_DIR, char_id + ".json")


def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def campaign_slug_from_name(name):
    s = (name or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s[:64]


def read_campaigns_registry():
    if not os.path.exists(CAMPAIGNS_REGISTRY_FILE):
        return []
    try:
        with open(CAMPAIGNS_REGISTRY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def write_campaigns_registry(items):
    with open(CAMPAIGNS_REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith((".html", ".js", ".css")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        if path == "/api/characters":
            self.handle_list_characters()
            return
        if path == "/api/trash":
            self.handle_list_trash()
            return
        if path == "/api/campaigns":
            self.handle_list_campaigns()
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
        if path.startswith("/api/campaign/") and path.endswith("/initiative/wait"):
            slug = path[len("/api/campaign/"):-len("/initiative/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_campaign_initiative(slug, since)
            return
        if path.startswith("/api/campaign/") and path.endswith("/initiative"):
            slug = path[len("/api/campaign/"):-len("/initiative")]
            self.handle_get_campaign_initiative(slug)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-map"):
            slug = path[len("/api/campaign/"):-len("/board-map")]
            self.handle_get_board_map(slug)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-state/wait"):
            slug = path[len("/api/campaign/"):-len("/board-state/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_board_state(slug, since)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-tokens/wait"):
            slug = path[len("/api/campaign/"):-len("/board-tokens/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_board_tokens(slug, since)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-tokens"):
            slug = path[len("/api/campaign/"):-len("/board-tokens")]
            self.handle_get_board_tokens(slug)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-shapes/wait"):
            slug = path[len("/api/campaign/"):-len("/board-shapes/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_board_shapes(slug, since)
            return
        if path.startswith("/api/campaign/") and path.endswith("/board-shapes"):
            slug = path[len("/api/campaign/"):-len("/board-shapes")]
            self.handle_get_board_shapes(slug)
            return
        if path.startswith("/api/dm/notes/"):
            slug = path[len("/api/dm/notes/"):]
            self.handle_get_dm_notes(slug)
            return
        if path.startswith("/api/dm/statblocks/") and path.endswith("/wait"):
            slug = path[len("/api/dm/statblocks/"):-len("/wait")]
            query = parse_qs(parsed.query)
            since = 0.0
            if "since" in query:
                try:
                    since = float(query["since"][0])
                except Exception:
                    since = 0.0
            self.handle_wait_dm_statblocks(slug, since)
            return
        if path.startswith("/api/dm/statblocks/"):
            slug = path[len("/api/dm/statblocks/"):]
            self.handle_get_dm_statblocks(slug)
            return
        if path.startswith("/api/dm/treasure/"):
            slug = path[len("/api/dm/treasure/"):]
            self.handle_get_dm_treasure(slug)
            return
        if path.startswith("/api/inbox/"):
            char_id = path[len("/api/inbox/"):]
            self.handle_get_inbox(char_id)
            return
        if path.startswith("/api/dm/") and path.endswith("/status"):
            slug = path[len("/api/dm/"):-len("/status")]
            self.handle_dm_status(slug)
            return
        if path == "/api/admin/campaigns":
            self.handle_admin_campaigns()
            return
        if path in ("/", ""):
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/campaigns":
            self.handle_create_campaign()
            return
        if self.path.startswith("/api/character/"):
            char_id = self.path[len("/api/character/"):]
            self.handle_post_character(char_id)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/initiative"):
            slug = self.path[len("/api/campaign/"):-len("/initiative")]
            self.handle_post_campaign_initiative(slug)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/board-map"):
            slug = self.path[len("/api/campaign/"):-len("/board-map")]
            self.handle_post_board_map(slug)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/board-tokens"):
            slug = self.path[len("/api/campaign/"):-len("/board-tokens")]
            self.handle_post_board_tokens(slug)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/board-shapes/add"):
            slug = self.path[len("/api/campaign/"):-len("/board-shapes/add")]
            self.handle_post_board_shapes_add(slug)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/board-shapes/remove"):
            slug = self.path[len("/api/campaign/"):-len("/board-shapes/remove")]
            self.handle_post_board_shapes_remove(slug)
            return
        if self.path.startswith("/api/campaign/") and self.path.endswith("/board-shapes"):
            slug = self.path[len("/api/campaign/"):-len("/board-shapes")]
            self.handle_post_board_shapes(slug)
            return
        if self.path.startswith("/api/trash/") and self.path.endswith("/restore"):
            char_id = self.path[len("/api/trash/"):-len("/restore")]
            self.handle_restore_character(char_id)
            return
        if self.path.startswith("/api/dm/notes/"):
            slug = self.path[len("/api/dm/notes/"):]
            self.handle_post_dm_notes(slug)
            return
        if self.path.startswith("/api/dm/statblocks/"):
            slug = self.path[len("/api/dm/statblocks/"):]
            self.handle_post_dm_statblocks(slug)
            return
        if self.path.startswith("/api/dm/treasure/"):
            slug = self.path[len("/api/dm/treasure/"):]
            self.handle_post_dm_treasure(slug)
            return
        if self.path.startswith("/api/inbox/") and self.path.endswith("/claim"):
            char_id = self.path[len("/api/inbox/"):-len("/claim")]
            self.handle_claim_inbox(char_id)
            return
        if self.path.startswith("/api/inbox/"):
            char_id = self.path[len("/api/inbox/"):]
            self.handle_post_inbox(char_id)
            return
        if self.path.startswith("/api/dm/") and self.path.endswith("/set-password"):
            slug = self.path[len("/api/dm/"):-len("/set-password")]
            self.handle_dm_set_password(slug)
            return
        if self.path.startswith("/api/dm/") and self.path.endswith("/login"):
            slug = self.path[len("/api/dm/"):-len("/login")]
            self.handle_dm_login(slug)
            return
        if self.path.startswith("/api/dm/") and self.path.endswith("/reset"):
            slug = self.path[len("/api/dm/"):-len("/reset")]
            self.handle_dm_reset(slug)
            return
        self.send_error(404)

    def do_DELETE(self):
        if self.path == "/api/trash":
            self.handle_empty_trash()
            return
        if self.path.startswith("/api/trash/"):
            char_id = self.path[len("/api/trash/"):]
            self.handle_delete_trash_item(char_id)
            return
        if self.path.startswith("/api/character/"):
            char_id = self.path[len("/api/character/"):]
            self.handle_delete_character(char_id)
            return
        if self.path.startswith("/api/campaigns/"):
            slug = self.path[len("/api/campaigns/"):]
            self.handle_delete_campaign(slug)
            return
        self.send_error(404)

    def handle_list_campaigns(self):
        self.write_json(200, read_campaigns_registry())

    def handle_create_campaign(self):
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        name = ((body or {}).get("name") or "").strip()
        if not name:
            self.send_error(400, "Campaign name required")
            return
        slug = campaign_slug_from_name(name)
        if not slug:
            self.send_error(400, "Campaign name not usable")
            return
        items = read_campaigns_registry()
        existing = next((c for c in items if c.get("slug") == slug), None)
        if existing:
            self.write_json(409, {"ok": False, "error": "exists", "campaign": existing})
            return
        entry = {"name": name, "slug": slug}
        items.append(entry)
        write_campaigns_registry(items)
        self.write_json(200, {"ok": True, "campaign": entry})

    def handle_delete_campaign(self, slug):
        if self.client_address[0] not in LOOPBACK_ADDRS:
            self.send_error(403, "Deleting campaigns is only allowed from the server's own machine")
            return
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        items = read_campaigns_registry()
        items = [c for c in items if c.get("slug") != slug]
        write_campaigns_registry(items)
        for path in (dm_auth_path(slug), os.path.join(CAMPAIGN_DIR, slug + ".json"), os.path.join(DM_NOTES_DIR, slug + ".json"), dm_statblocks_path(slug), dm_treasure_path(slug), dm_board_map_path(slug), dm_board_tokens_path(slug), dm_board_shapes_path(slug)):
            if os.path.exists(path):
                os.remove(path)
        for token in [t for t, s in dm_tokens.items() if s == slug]:
            del dm_tokens[token]
        self.write_json(200, {"ok": True})

    def handle_list_characters(self):
        items = []
        if os.path.isdir(CHAR_DIR):
            for fname in os.listdir(CHAR_DIR):
                if not fname.endswith(".json"):
                    continue
                char_id = fname[:-5]
                full = os.path.join(CHAR_DIR, fname)
                meta = {}
                summons = []
                try:
                    with open(full, "r", encoding="utf-8") as f:
                        parsed = json.load(f)
                    meta = (parsed or {}).get("meta") or {}
                    summons = [s.get("name", "") for s in ((parsed or {}).get("summons") or []) if s.get("name")]
                except Exception:
                    pass
                items.append({
                    "id": char_id,
                    "name": meta.get("name", ""),
                    "meta": meta,
                    "summons": summons,
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
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
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

    def handle_get_campaign_initiative(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = campaign_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body, updated_at=os.path.getmtime(path))
        else:
            self.write_raw_json(200, "{}", updated_at=0)

    def handle_wait_campaign_initiative(self, slug, since):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = campaign_path(slug)
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
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            time.sleep(POLL_INTERVAL)

    def handle_post_campaign_initiative(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            parsed = json.loads(raw.decode("utf-8"))
        except Exception:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(CAMPAIGN_DIR, exist_ok=True)
        path = campaign_path(slug)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2)
        self.write_json(200, {"ok": True, "updatedAt": os.path.getmtime(path)})

    def handle_get_board_map(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = dm_board_map_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body)
        else:
            self.write_raw_json(200, json.dumps({"image": "", "gridCols": 20, "gridRows": 15}))

    def handle_post_board_map(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_BOARD_MAP_DIR, exist_ok=True)
        data = {
            "image": (body or {}).get("image", ""),
            "gridCols": (body or {}).get("gridCols", 20),
            "gridRows": (body or {}).get("gridRows", 15),
        }
        path = dm_board_map_path(slug)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        self.write_json(200, {"ok": True})

    def handle_get_board_tokens(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = dm_board_tokens_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body, updated_at=os.path.getmtime(path))
        else:
            self.write_raw_json(200, json.dumps({"tokens": []}), updated_at=0)

    def handle_wait_board_state(self, slug, since):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        tokens_path = dm_board_tokens_path(slug)
        shapes_path = dm_board_shapes_path(slug)
        deadline = time.time() + WAIT_TIMEOUT
        while True:
            t_mtime = os.path.getmtime(tokens_path) if os.path.exists(tokens_path) else 0
            s_mtime = os.path.getmtime(shapes_path) if os.path.exists(shapes_path) else 0
            mtime = max(t_mtime, s_mtime)
            if mtime > since:
                if os.path.exists(tokens_path):
                    with open(tokens_path, "r", encoding="utf-8") as f:
                        tokens_data = json.load(f)
                else:
                    tokens_data = {"tokens": []}
                if os.path.exists(shapes_path):
                    with open(shapes_path, "r", encoding="utf-8") as f:
                        shapes_data = json.load(f)
                else:
                    shapes_data = {"shapes": []}
                combined = {
                    "tokens": tokens_data.get("tokens", []),
                    "shapes": shapes_data.get("shapes", []),
                    "tokensUpdatedAt": t_mtime,
                    "shapesUpdatedAt": s_mtime,
                }
                self.write_raw_json(200, json.dumps(combined), updated_at=mtime)
                return
            if time.time() >= deadline:
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            time.sleep(POLL_INTERVAL)

    def handle_wait_board_tokens(self, slug, since):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = dm_board_tokens_path(slug)
        deadline = time.time() + WAIT_TIMEOUT
        while True:
            mtime = os.path.getmtime(path) if os.path.exists(path) else 0
            if mtime > since:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        body = f.read()
                else:
                    body = json.dumps({"tokens": []})
                self.write_raw_json(200, body, updated_at=mtime)
                return
            if time.time() >= deadline:
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            time.sleep(POLL_INTERVAL)

    def handle_post_board_tokens(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_BOARD_TOKENS_DIR, exist_ok=True)
        path = dm_board_tokens_path(slug)
        tokens = (body or {}).get("tokens") or []
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"tokens": tokens}, f, indent=2)
        self.write_json(200, {"ok": True, "updatedAt": os.path.getmtime(path)})

    def handle_get_board_shapes(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = dm_board_shapes_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body, updated_at=os.path.getmtime(path))
        else:
            self.write_raw_json(200, json.dumps({"shapes": []}), updated_at=0)

    def handle_wait_board_shapes(self, slug, since):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        path = dm_board_shapes_path(slug)
        deadline = time.time() + WAIT_TIMEOUT
        while True:
            mtime = os.path.getmtime(path) if os.path.exists(path) else 0
            if mtime > since:
                if os.path.exists(path):
                    with open(path, "r", encoding="utf-8") as f:
                        body = f.read()
                else:
                    body = json.dumps({"shapes": []})
                self.write_raw_json(200, body, updated_at=mtime)
                return
            if time.time() >= deadline:
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            time.sleep(POLL_INTERVAL)

    def handle_post_board_shapes(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_BOARD_SHAPES_DIR, exist_ok=True)
        path = dm_board_shapes_path(slug)
        shapes = (body or {}).get("shapes") or []
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"shapes": shapes}, f, indent=2)
        self.write_json(200, {"ok": True, "updatedAt": os.path.getmtime(path)})

    def handle_post_board_shapes_add(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        shape = (body or {}).get("shape")
        if not shape or not shape.get("id"):
            self.send_error(400, "Shape with an id is required")
            return
        os.makedirs(DM_BOARD_SHAPES_DIR, exist_ok=True)
        path = dm_board_shapes_path(slug)
        with board_shapes_lock:
            shapes = []
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    shapes = data.get("shapes") or []
                except Exception:
                    shapes = []
            shapes.append(shape)
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"shapes": shapes}, f, indent=2)
            updated_at = os.path.getmtime(path)
        self.write_json(200, {"ok": True, "updatedAt": updated_at})

    def handle_post_board_shapes_remove(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        shape_id = (body or {}).get("id")
        if not shape_id:
            self.send_error(400, "Shape id is required")
            return
        path = dm_board_shapes_path(slug)
        with board_shapes_lock:
            shapes = []
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    shapes = data.get("shapes") or []
                except Exception:
                    shapes = []
            shapes = [s for s in shapes if s.get("id") != shape_id]
            os.makedirs(DM_BOARD_SHAPES_DIR, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"shapes": shapes}, f, indent=2)
            updated_at = os.path.getmtime(path)
        self.write_json(200, {"ok": True, "updatedAt": updated_at})

    def handle_delete_character(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = char_path(char_id)
        if os.path.exists(path):
            os.makedirs(TRASH_DIR, exist_ok=True)
            os.replace(path, trash_path(char_id))
        self.write_json(200, {"ok": True})

    def handle_list_trash(self):
        items = []
        if os.path.isdir(TRASH_DIR):
            for fname in os.listdir(TRASH_DIR):
                if not fname.endswith(".json"):
                    continue
                char_id = fname[:-5]
                full = os.path.join(TRASH_DIR, fname)
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
                    "deletedAt": os.path.getmtime(full)
                })
        items.sort(key=lambda c: c["deletedAt"], reverse=True)
        self.write_json(200, items)

    def handle_restore_character(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        src = trash_path(char_id)
        if not os.path.exists(src):
            self.send_error(404, "Not in trash")
            return
        dest = char_path(char_id)
        if os.path.exists(dest):
            self.send_error(409, "A character with this id already exists")
            return
        os.makedirs(CHAR_DIR, exist_ok=True)
        os.replace(src, dest)
        self.write_json(200, {"ok": True})

    def handle_delete_trash_item(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = trash_path(char_id)
        if os.path.exists(path):
            os.remove(path)
        self.write_json(200, {"ok": True})

    def handle_empty_trash(self):
        removed = 0
        if os.path.isdir(TRASH_DIR):
            for fname in os.listdir(TRASH_DIR):
                if fname.endswith(".json"):
                    os.remove(os.path.join(TRASH_DIR, fname))
                    removed += 1
        self.write_json(200, {"ok": True, "removed": removed})

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            return json.loads(raw.decode("utf-8")) if raw else {}
        except Exception:
            return None

    def check_dm_token(self, slug):
        token = self.headers.get("X-DM-Token")
        return bool(token) and dm_tokens.get(token) == slug

    def handle_dm_status(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        self.write_json(200, {"hasPassword": os.path.exists(dm_auth_path(slug))})

    def handle_dm_set_password(self, slug):
        body = self.read_json_body()
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if os.path.exists(dm_auth_path(slug)):
            self.send_error(409, "Password already set for this campaign")
            return
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        password = (body or {}).get("password") or ""
        if not password:
            self.send_error(400, "Password required")
            return
        os.makedirs(DM_AUTH_DIR, exist_ok=True)
        token = secrets.token_hex(16)
        with open(dm_auth_path(slug), "w", encoding="utf-8") as f:
            json.dump({"passwordHash": hash_password(password), "tokens": [token]}, f)
        dm_tokens[token] = slug
        self.write_json(200, {"ok": True, "token": token})

    def handle_dm_login(self, slug):
        body = self.read_json_body()
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not os.path.exists(dm_auth_path(slug)):
            self.send_error(404, "No password set for this campaign")
            return
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        password = (body or {}).get("password") or ""
        with open(dm_auth_path(slug), "r", encoding="utf-8") as f:
            stored = json.load(f)
        if hash_password(password) != stored.get("passwordHash"):
            self.send_error(401, "Incorrect password")
            return
        token = secrets.token_hex(16)
        dm_tokens[token] = slug
        tokens = stored.get("tokens") or []
        tokens.append(token)
        stored["tokens"] = tokens[-10:]
        with open(dm_auth_path(slug), "w", encoding="utf-8") as f:
            json.dump(stored, f)
        self.write_json(200, {"ok": True, "token": token})

    def handle_dm_reset(self, slug):
        self.read_json_body()
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if self.client_address[0] not in LOOPBACK_ADDRS:
            self.send_error(403, "Reset is only allowed from the server's own machine")
            return
        path = dm_auth_path(slug)
        if os.path.exists(path):
            os.remove(path)
        for token in [t for t, s in dm_tokens.items() if s == slug]:
            del dm_tokens[token]
        self.write_json(200, {"ok": True})

    def handle_admin_campaigns(self):
        if self.client_address[0] not in LOOPBACK_ADDRS:
            self.send_error(403, "Admin panel is only available from the server's own machine")
            return
        items = read_campaigns_registry()
        known_slugs = set(c.get("slug") for c in items)
        result = []
        for c in items:
            result.append({
                "name": c.get("name"),
                "slug": c.get("slug"),
                "hasPassword": os.path.exists(dm_auth_path(c.get("slug"))),
                "registered": True,
            })
        if os.path.isdir(DM_AUTH_DIR):
            for fname in os.listdir(DM_AUTH_DIR):
                if not fname.endswith(".json"):
                    continue
                slug = fname[:-len(".json")]
                if slug in known_slugs:
                    continue
                result.append({
                    "name": slug,
                    "slug": slug,
                    "hasPassword": True,
                    "registered": False,
                })
        result.sort(key=lambda c: (c.get("name") or "").lower())
        self.write_json(200, result)

    def handle_get_dm_notes(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        path = dm_notes_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body)
        else:
            self.write_raw_json(200, json.dumps({"text": "", "updatedAt": 0}))

    def handle_post_dm_notes(self, slug):
        body = self.read_json_body()
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_NOTES_DIR, exist_ok=True)
        path = dm_notes_path(slug)
        text = (body or {}).get("text", "")
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"text": text, "updatedAt": time.time()}, f)
        self.write_json(200, {"ok": True})

    def handle_get_dm_statblocks(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        path = dm_statblocks_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body, updated_at=os.path.getmtime(path))
        else:
            self.write_raw_json(200, "{}", updated_at=0)

    def handle_wait_dm_statblocks(self, slug, since):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        path = dm_statblocks_path(slug)
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
                try:
                    self.send_response(204)
                    self.send_header("Cache-Control", "no-store")
                    self.send_header("X-Updated-At", str(mtime))
                    self.end_headers()
                except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
                    pass
                return
            time.sleep(POLL_INTERVAL)

    def handle_post_dm_statblocks(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            parsed = json.loads(raw.decode("utf-8"))
        except Exception:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_STATBLOCKS_DIR, exist_ok=True)
        path = dm_statblocks_path(slug)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2)
        self.write_json(200, {"ok": True, "updatedAt": os.path.getmtime(path)})

    def handle_get_dm_treasure(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        path = dm_treasure_path(slug)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body)
        else:
            self.write_raw_json(200, json.dumps({"items": []}))

    def handle_post_dm_treasure(self, slug):
        if not CAMPAIGN_SLUG_RE.match(slug):
            self.send_error(400, "Invalid campaign slug")
            return
        if not self.check_dm_token(slug):
            self.send_error(401, "Not authorized")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        os.makedirs(DM_TREASURE_DIR, exist_ok=True)
        path = dm_treasure_path(slug)
        items = (body or {}).get("items") or []
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"items": items}, f, indent=2)
        self.write_json(200, {"ok": True})

    def handle_get_inbox(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        path = inbox_path(char_id)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                body = f.read()
            self.write_raw_json(200, body)
        else:
            self.write_raw_json(200, json.dumps({"items": []}))

    def handle_post_inbox(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        item = (body or {}).get("item")
        container = (body or {}).get("container")
        if container:
            if not container.get("items") and not container.get("currency"):
                self.send_error(400, "Empty container")
                return
            entry = {
                "id": "itm-" + secrets.token_hex(6),
                "kind": "container",
                "name": container.get("name", ""),
                "currency": container.get("currency") or {},
                "items": container.get("items") or [],
                "from": container.get("from", ""),
            }
        else:
            if not item or not (item.get("name") or "").strip():
                self.send_error(400, "Item name required")
                return
            entry = {
                "id": "itm-" + secrets.token_hex(6),
                "kind": "item",
                "name": item.get("name", ""),
                "qty": item.get("qty", 1),
                "weight": item.get("weight", 0),
                "notes": item.get("notes", ""),
                "from": item.get("from", ""),
            }
        os.makedirs(INBOX_DIR, exist_ok=True)
        path = inbox_path(char_id)
        data = {"items": []}
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {"items": []}
        data.setdefault("items", []).append(entry)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        self.write_json(200, {"ok": True, "item": entry})

    def handle_claim_inbox(self, char_id):
        if not ID_RE.match(char_id):
            self.send_error(400, "Invalid character id")
            return
        body = self.read_json_body()
        if body is None:
            self.send_error(400, "Invalid JSON")
            return
        ids = set((body or {}).get("ids") or [])
        path = inbox_path(char_id)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = {"items": []}
            data["items"] = [it for it in (data.get("items") or []) if it.get("id") not in ids]
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        self.write_json(200, {"ok": True})

    def write_json(self, status, obj):
        self.write_raw_json(status, json.dumps(obj))

    def write_raw_json(self, status, body_str, updated_at=None):
        data = body_str.encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            if updated_at is not None:
                self.send_header("X-Updated-At", str(updated_at))
            self.end_headers()
            self.wfile.write(data)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError, OSError):
            pass

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


SINGLE_INSTANCE_LOCK_PORT = 47632
_single_instance_lock_socket = None


def acquire_single_instance_lock():
    global _single_instance_lock_socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("127.0.0.1", SINGLE_INSTANCE_LOCK_PORT))
        sock.listen(1)
    except OSError:
        sock.close()
        return False
    # Keep this socket open (and referenced) for the life of the process.
    # The OS releases it automatically on exit, however the process ends
    # (Ctrl+C, closed terminal, Task Manager kill) - unlike a PID file,
    # this can never go stale.
    _single_instance_lock_socket = sock
    return True


def main():
    os.chdir(BASE_DIR)
    if not acquire_single_instance_lock():
        print("Another instance of this server already appears to be running.")
        print("Stop it first (Ctrl+C in its window, or end its python.exe process")
        print("in Task Manager) before starting a new one.")
        sys.exit(1)
    migrate_legacy_file()
    load_persisted_dm_tokens()
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
