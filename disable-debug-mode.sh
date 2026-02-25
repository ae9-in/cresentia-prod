#!/bin/bash

# Disable Debug Mode for Course Loading
# This script restores the original CourseDetailPage

echo "🔧 Disabling Debug Mode..."
echo ""

cd frontend/src/pages

# Check if backup exists
if [ ! -f "CourseDetailPage-OLD.jsx" ]; then
    echo "❌ Error: CourseDetailPage-OLD.jsx not found"
    echo "Debug mode may not be enabled, or backup was deleted"
    exit 1
fi

# Restore original
echo "📦 Restoring original CourseDetailPage.jsx..."
rm -f CourseDetailPage.jsx
mv CourseDetailPage-OLD.jsx CourseDetailPage.jsx

echo ""
echo "✅ Debug mode disabled!"
echo ""
echo "📋 Original CourseDetailPage.jsx restored"
echo "Refresh your browser to see normal view"
echo ""
