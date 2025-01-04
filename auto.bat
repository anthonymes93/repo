@echo off
:loop
git add .
git commit -m "Auto-save"
git push
timeout 60
goto loop
