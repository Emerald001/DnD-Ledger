' Double-click this to open the Server Manager window.
' Runs silently in the background - no console window pops up, just the
' manager's Start/Stop/Restart window.

Dim fso, shell, scriptDir, scriptPath
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
scriptPath = fso.BuildPath(scriptDir, "server_manager.py")

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = scriptDir
shell.Run "python """ & scriptPath & """", 0, False
