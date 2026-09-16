#!/bin/sh
# Double-click (or run "./start-server.sh") to open the Server Manager window.
# Works on Linux and macOS. Requires python3 with tkinter (on Debian/Ubuntu:
# sudo apt install python3-tk).
cd "$(dirname "$0")"
exec python3 server_manager.py
