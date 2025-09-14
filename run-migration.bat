@echo off
echo Running database migration to fix notifications and meal plans...
echo.

REM Try to run the migration using npx
echo Attempting to run migration with npx...
npx supabase db reset
if %errorlevel% neq 0 (
    echo npx failed, trying alternative approach...
    echo.
    echo Please run the following commands manually:
    echo 1. npx supabase db reset
    echo 2. Or copy the SQL from: supabase/migrations/20250915000003_fix_notifications_and_meal_plans.sql
    echo 3. Run it in your Supabase dashboard SQL editor
    echo.
    pause
) else (
    echo Migration completed successfully!
    echo.
    echo The following tables have been created/updated:
    echo - messages (for notifications)
    echo - ai_suggestions (for AI tips)
    echo - student_meals (for logged meals)
    echo - personalized_meal_plan_items (for AI-generated meal plans)
    echo.
    echo You can now test the notification and meal plan systems!
    pause
)
