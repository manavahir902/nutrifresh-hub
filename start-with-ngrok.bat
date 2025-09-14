@echo off
echo Starting NutriFresh Hub with ngrok...

REM Start the development server in background
start "Dev Server" cmd /k "npm run dev"

REM Wait a moment for the server to start
timeout /t 5 /nobreak > nul

REM Start ngrok
echo Starting ngrok tunnel...
ngrok start nutrifresh --config=ngrok.yml

pause
