# DnD Ledger

A self-hosted D&D 5e character sheet and virtual tabletop for running games with friends over your local network — no accounts, no cloud, just a Python script and a browser.

## Features

- Full character sheet with an effects engine, character creator wizard, and inventory/currency tracking
- DM screen: initiative tracker, monster/NPC stat block importer, notes, loot containers you can hand out to players, a session planner (sections and rooms/scenes you can check off during play), and a customizable world building page
- Live battle map: draggable tokens sized by creature, ruler/circle/cone templates, tile marks and pings — synced instantly between the DM and every player
- Bastion builder: shared multi-floor grid editor with rooms, corridors, stairs and a per-room info panel — any player in the campaign can build it, synced live, gated behind a DM on/off switch
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

## Save data

All save data (characters, campaigns, DM screen data, etc.) lives in its own folder, separate from the app, so it can be kept in its own Git repo and synced between machines. By default that is a `DnD-Ledger-Data` folder next to this one:

```
UnityProjects/
├── DnD-Ledger/        ← this app
└── DnD-Ledger-Data/   ← your saves
```

To use a different location, click **Browse…** next to "Save data folder" in the Server Manager window. The choice is remembered per machine (in `server-manager.json`, which is not committed). Without the GUI, set the `DND_LEDGER_DATA` environment variable to the folder you want before running `server.py`.

On first start, any save data still inside the app folder (from older versions) is moved into the data folder automatically. Nothing is overwritten: if a file or folder already exists in the data folder, the old copy is left where it was and the server log says so.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify, and contribute to for any noncommercial purpose. Reselling it or offering it as a paid product/service is not permitted.

## Credit

This entire project — every feature, every line of code — was built by pairing with [Claude](https://claude.com/claude-code). More than 99% of it is Claude's work.
