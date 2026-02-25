@echo off
REM Disable Debug Mode for Course Loading
REM This script restores the original CourseDetailPage

echo.
echo 🔧 Disabling Debug Mode...
echo.

cd frontend\src\pages

REM Check if backup exists
if not exist "CourseDetailPage-OLD.jsx" (
    echo ❌ Error: CourseDetailPage-OLD.jsx not found
    echo Debug mode may not be enabled, or backup was deleted
    exit /b 1
)

REM Restore original
echo 📦 Restoring original CourseDetailPage.jsx...
del /F CourseDetailPage.jsx
move /Y CourseDetailPage-OLD.jsx CourseDetailPage.jsx

echo.
echo ✅ Debug mode disabled!
echo.
echo 📋 Original CourseDetailPage.jsx restored
echo Refresh your browser to see normal view
echo.

cd ..\..\..
pause
