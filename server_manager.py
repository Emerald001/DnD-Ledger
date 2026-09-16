"""
Small GUI for starting/stopping the Character Ledger server.

Runs server.py as a child process it owns, so there is always at most one
server started from here, and closing this window (or clicking Stop) always
cleanly kills it - no more orphaned python.exe processes left running after
a terminal window gets closed.
"""

import os
import queue
import subprocess
import sys
import threading
import tkinter as tk
import webbrowser
from tkinter import scrolledtext

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_SCRIPT = os.path.join(BASE_DIR, "server.py")
DEFAULT_PORT = 8000


class ServerManager:
    def __init__(self, root):
        self.root = root
        self.proc = None
        self.log_queue = queue.Queue()
        self._build_ui()
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        self.root.after(150, self._poll)

    def _build_ui(self):
        self.root.title("Character Ledger — Server Manager")
        self.root.geometry("680x440")
        self.root.minsize(480, 320)

        top = tk.Frame(self.root, padx=8, pady=8)
        top.pack(fill="x")

        self.status_var = tk.StringVar(value="Stopped")
        self.status_label = tk.Label(top, textvariable=self.status_var, font=("Segoe UI", 11, "bold"), fg="#aa3333")
        self.status_label.pack(side="left")

        tk.Label(top, text="Port:").pack(side="left", padx=(16, 4))
        self.port_var = tk.StringVar(value=str(DEFAULT_PORT))
        self.port_entry = tk.Entry(top, textvariable=self.port_var, width=6)
        self.port_entry.pack(side="left")

        btns = tk.Frame(self.root, padx=8)
        btns.pack(fill="x")
        self.start_btn = tk.Button(btns, text="Start Server", width=14, command=self.start_server)
        self.start_btn.pack(side="left", padx=2, pady=4)
        self.stop_btn = tk.Button(btns, text="Stop Server", width=14, command=self.stop_server, state="disabled")
        self.stop_btn.pack(side="left", padx=2)
        self.restart_btn = tk.Button(btns, text="Restart", width=10, command=self.restart_server, state="disabled")
        self.restart_btn.pack(side="left", padx=2)
        self.browser_btn = tk.Button(btns, text="Open in Browser", width=16, command=self.open_browser, state="disabled")
        self.browser_btn.pack(side="left", padx=2)

        self.log_widget = scrolledtext.ScrolledText(
            self.root, state="disabled", bg="#111111", fg="#dddddd",
            insertbackground="#dddddd", font=("Consolas", 9)
        )
        self.log_widget.pack(fill="both", expand=True, padx=8, pady=(4, 8))

    def log(self, text):
        self.log_queue.put(text)

    def _poll(self):
        try:
            while True:
                text = self.log_queue.get_nowait()
                self.log_widget.configure(state="normal")
                self.log_widget.insert("end", text)
                self.log_widget.see("end")
                self.log_widget.configure(state="disabled")
        except queue.Empty:
            pass
        if self.proc is not None and self.proc.poll() is not None:
            code = self.proc.returncode
            self.proc = None
            self._set_stopped("Stopped (exited, code %s)" % code)
        self.root.after(150, self._poll)

    def _set_running(self):
        self.status_var.set("Running (PID %d)" % self.proc.pid)
        self.status_label.configure(fg="#228822")
        self.start_btn.configure(state="disabled")
        self.port_entry.configure(state="disabled")
        self.stop_btn.configure(state="normal")
        self.restart_btn.configure(state="normal")
        self.browser_btn.configure(state="normal")

    def _set_stopped(self, text="Stopped"):
        self.status_var.set(text)
        self.status_label.configure(fg="#aa3333")
        self.start_btn.configure(state="normal")
        self.port_entry.configure(state="normal")
        self.stop_btn.configure(state="disabled")
        self.restart_btn.configure(state="disabled")
        self.browser_btn.configure(state="disabled")

    def start_server(self):
        if self.proc is not None:
            return
        port = self.port_var.get().strip() or str(DEFAULT_PORT)
        self.log_widget.configure(state="normal")
        self.log_widget.delete("1.0", "end")
        self.log_widget.configure(state="disabled")
        creationflags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        try:
            self.proc = subprocess.Popen(
                [sys.executable, "-u", SERVER_SCRIPT, port],
                cwd=BASE_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
                creationflags=creationflags,
            )
        except Exception as e:
            self.log("Failed to start: %s\n" % e)
            return
        self._set_running()
        threading.Thread(target=self._read_output, args=(self.proc,), daemon=True).start()

    def _read_output(self, proc):
        if proc.stdout is None:
            return
        for line in proc.stdout:
            self.log(line)

    def stop_server(self):
        if self.proc is None:
            return
        proc = self.proc
        self.log("\n--- Stopping server ---\n")
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
        self.proc = None
        self._set_stopped()

    def restart_server(self):
        self.stop_server()
        self.root.after(400, self.start_server)

    def open_browser(self):
        port = self.port_var.get().strip() or str(DEFAULT_PORT)
        webbrowser.open("http://localhost:%s" % port)

    def on_close(self):
        if self.proc is not None:
            self.stop_server()
        self.root.destroy()


def main():
    root = tk.Tk()
    ServerManager(root)
    root.mainloop()


if __name__ == "__main__":
    main()
