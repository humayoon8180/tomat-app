@echo off
title TOMAT App - Sync Cloud Database to Local XAMPP
echo ========================================================
echo  Syncing Live Cloud Database to Local XAMPP MySQL...
echo ========================================================
cd /d "%~dp0"
.\venv\Scripts\python.exe sync_cloud_to_local.py
pause
