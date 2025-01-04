@echo off
:loop
git add .
git commit -m "Auto-save: %date% %time%"
git push
timeout /t 60
goto loop