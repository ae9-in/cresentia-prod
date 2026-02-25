@echo off
REM Enable Debug Mode for Course Loading
REM This script switches to the debug version of CourseDetailPage

echo.
echo 🔧 Enabling Debug Mode...
echo.

cd frontend\src\pages

REM Check if files exist
if not exist "CourseDetailPage.jsx" (
    echo ❌ Error: CourseDetailPage.jsx not found
    exit /b 1
)

if not exist "CourseDetailPage-DEBUG.jsx" (
    echo ❌ Error: CourseDetailPage-DEBUG.jsx not found
    exit /b 1
)

REM Backup original
echo 📦 Backing up original CourseDetailPage.jsx...
move /Y CourseDetailPage.jsx CourseDetailPage-OLD.jsx

REM Enable debug version
echo 🐛 Enabling debug version...
copy /Y CourseDetailPage-DEBUG.jsx CourseDetailPage.jsx

echo.
echo ✅ Debug mode enabled!
echo.
echo 📋 Next steps:
echo 1. Refresh your browser (Ctrl + Shift + R)
echo 2. Login as student
echo 3. Go to Dashboard
echo 4. Click 'Start Course'
echo 5. You'll see a GREEN DEBUG SCREEN
echo.
echo To disable debug mode, run: disable-debug-mode.bat
echo.

cd ..\..\..
pause
