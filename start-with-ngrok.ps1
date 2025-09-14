Write-Host "Starting NutriFresh Hub with ngrok..." -ForegroundColor Green

# Start the development server in background
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal

# Wait for the server to start
Write-Host "Waiting for development server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok
Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
ngrok start nutrifresh --config=ngrok.yml
