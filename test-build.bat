@echo off
REM Test Build Script for Windows
REM This script tests the optimized production build

echo.
echo 🚀 Testing Optimized Production Build
echo ======================================
echo.

REM Navigate to frontend
cd frontend

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist
echo ✅ Clean complete
echo.

REM Run build
echo 🔨 Building for production...
call npm run build

REM Check if build succeeded
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo.
    
    REM Show build output
    echo 📦 Build Output:
    echo ----------------
    dir dist
    echo.
    
    REM Show assets
    echo 📁 Assets:
    echo ----------
    dir dist\assets
    echo.
    
    REM Show JS chunks
    if exist dist\assets\js (
        echo 📜 JavaScript Chunks:
        echo ---------------------
        dir dist\assets\js
        echo.
    )
    
    REM Show CSS files
    if exist dist\assets\css (
        echo 🎨 CSS Files:
        echo -------------
        dir dist\assets\css
        echo.
    )
    
    echo 🎉 Build test complete!
    echo.
    echo To preview the build, run:
    echo   cd frontend ^&^& npm run preview
) else (
    echo.
    echo ❌ Build failed!
    echo Check the error messages above.
    exit /b 1
)
