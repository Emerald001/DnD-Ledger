# DnD Ledger

A self-hosted D&D 5e character sheet and virtual tabletop for running games with friends over your local network — no accounts, no cloud, just a Python script and a browser.

## Features

- Full character sheet with an effects engine, character creator wizard, and inventory/currency tracking
- DM screen: initiative tracker, monster/NPC stat block importer, notes, and loot containers you can hand out to players
- Live battle map: draggable tokens sized by creature, ruler/circle/cone templates, tile marks and pings — synced instantly between the DM and every player
- Everything syncs live across devices on your network with no manual refreshing

## Running it

Easiest way — double-click the launcher for your OS, which opens a small Start/Stop/Restart window with a live log:

- **Windows:** `Start Server.vbs`
- **macOS:** `Start Server.command`
- **Linux:** `start-server.sh` (or run `./start-server.sh` in a terminal)

All three just open `server_manager.py`, a small Tk GUI (requires `python3-tk` on some Linux distros, e.g. `sudo apt install python3-tk`).

Or run it directly with no GUI:

```
python server.py
```

Then open `http://localhost:8000`. Plain Python standard library either way — no dependencies to install.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify, and contribute to for any noncommercial purpose. Reselling it or offering it as a paid product/service is not permitted.

## Credit

This entire project — every feature, every line of code — was built by pairing with [Claude](https://claude.com/claude-code). More than 99% of it is Claude's work.
