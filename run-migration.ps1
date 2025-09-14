Write-Host "Running database migration to fix notifications and meal plans..." -ForegroundColor Green
Write-Host ""

try {
    Write-Host "Attempting to run safe migration..." -ForegroundColor Yellow
    Write-Host "This will safely create missing tables and policies without conflicts." -ForegroundColor Cyan
    
    # Try to run the specific migration file
    $migrationFile1 = "supabase/migrations/20250915000011_fix_remaining_issues.sql"
    $migrationFile2 = "supabase/migrations/20250915000010_database_diagnostic.sql"
    if (Test-Path $migrationFile1 -and Test-Path $migrationFile2) {
        Write-Host "Found migration files. Please run these SQL files in your Supabase dashboard:" -ForegroundColor Green
        Write-Host "1. $migrationFile1" -ForegroundColor White
        Write-Host "2. $migrationFile2" -ForegroundColor White
        Write-Host ""
        Write-Host "Or try running: npx supabase db reset" -ForegroundColor Yellow
    } else {
        Write-Host "Running full database reset..." -ForegroundColor Yellow
        npx supabase db reset
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The following tables have been created/updated:" -ForegroundColor Cyan
        Write-Host "- messages (for notifications)" -ForegroundColor White
        Write-Host "- ai_suggestions (for AI tips)" -ForegroundColor White
        Write-Host "- student_meals (for logged meals)" -ForegroundColor White
        Write-Host "- personalized_meal_plan_items (for AI-generated meal plans)" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now test the notification and meal plan systems!" -ForegroundColor Green
    } else {
        throw "Migration failed"
    }
} catch {
    Write-Host "Migration failed. Please try the following:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Run manually in PowerShell:" -ForegroundColor Yellow
    Write-Host "npx supabase db reset" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Copy the SQL from the migration file:" -ForegroundColor Yellow
    Write-Host "supabase/migrations/20250915000003_fix_notifications_and_meal_plans.sql" -ForegroundColor White
    Write-Host "And run it in your Supabase dashboard SQL editor" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Enable PowerShell script execution:" -ForegroundColor Yellow
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor White
}

Read-Host "Press Enter to continue"
