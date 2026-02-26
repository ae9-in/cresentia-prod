#!/bin/bash

# Test Build Script
# This script tests the optimized production build

echo "🚀 Testing Optimized Production Build"
echo "======================================"
echo ""

# Navigate to frontend
cd frontend

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
echo "✅ Clean complete"
echo ""

# Run build
echo "🔨 Building for production..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    # Show build output
    echo "📦 Build Output:"
    echo "----------------"
    ls -lh dist/
    echo ""
    
    # Show assets
    echo "📁 Assets:"
    echo "----------"
    ls -lh dist/assets/
    echo ""
    
    # Show JS chunks
    if [ -d "dist/assets/js" ]; then
        echo "📜 JavaScript Chunks:"
        echo "---------------------"
        ls -lh dist/assets/js/
        echo ""
    fi
    
    # Show CSS files
    if [ -d "dist/assets/css" ]; then
        echo "🎨 CSS Files:"
        echo "-------------"
        ls -lh dist/assets/css/
        echo ""
    fi
    
    # Show total size
    echo "📊 Total Build Size:"
    echo "--------------------"
    du -sh dist/
    echo ""
    
    echo "🎉 Build test complete!"
    echo ""
    echo "To preview the build, run:"
    echo "  cd frontend && npm run preview"
else
    echo ""
    echo "❌ Build failed!"
    echo "Check the error messages above."
    exit 1
fi
