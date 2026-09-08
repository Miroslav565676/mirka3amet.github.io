@echo off
title mirka3amet
echo Запуск mirka3amet...
timeout /t 3 /nobreak >nul
start msedge --kiosk --inprivate "https://miroslav565676.github.io/mirka3amet.github.io/" 2>nul || start chrome --kiosk "https://miroslav565676.github.io/mirka3amet.github.io/" 2>nul || start "" "https://miroslav565676.github.io/mirka3amet.github.io/"
