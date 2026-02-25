#!/bin/bash

# Enable Debug Mode for Course Loading
# This script switches to the debug version of CourseDetailPage

echo "🔧 Enabling Debug Mode..."
echo ""

cd frontend/src/pages

# Check if files exist
if [ ! -f "CourseDetailPage.jsx" ]; then
    echo "❌ Error: CourseDetailPage.jsx not found"
    exit 1
fi

if [ ! -f "CourseDetailPage-DEBUG.jsx" ]; then
    echo "❌ Error: CourseDetailPage-DEBUG.jsx not found"
    exit 1
fi

# Backup original
echo "📦 Backing up original CourseDetailPage.jsx..."
mv CourseDetailPage.jsx CourseDetailPage-OLD.jsx

# Enable debug version
echo "🐛 Enabling debug version..."
cp CourseDetailPage-DEBUG.jsx CourseDetailPage.jsx

echo ""
echo "✅ Debug mode enabled!"
echo ""
echo "📋 Next steps:"
echo "1. Refresh your browser (Ctrl + Shift + R)"
echo "2. Login as student"
echo "3. Go to Dashboard"
echo "4. Click 'Start Course'"
echo "5. You'll see a GREEN DEBUG SCREEN"
echo ""
echo "To disable debug mode, run: ./disable-debug-mode.sh"
echo ""
