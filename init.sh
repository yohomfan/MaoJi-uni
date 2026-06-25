#!/bin/bash

# 毛叽 Maoji - Development Environment Initialization Script
# This script sets up and starts the uni-app H5 development server for verification

set -e  # Exit on error

echo "=================================="
echo "毛叽 Maoji - 初始化开发环境"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js (v16 or later) from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Current directory: $(pwd)"
    echo "Please run this script from the project root"
    exit 1
fi

echo "📦 Installing dependencies..."
echo ""
npm install

echo ""
echo "=================================="
echo "✓ Dependencies installed successfully"
echo "=================================="
echo ""

echo "🚀 Starting H5 development server..."
echo ""
echo "The app will be available at: http://localhost:5173"
echo ""
echo "📸 The autonomous harness will verify features by:"
echo "   - Navigating the H5 build with Puppeteer"
echo "   - Taking screenshots as evidence"
echo "   - Running unit tests for pure logic"
echo ""
echo "🎯 Ship target (mp-weixin) can be built with:"
echo "   npm run build:mp-weixin"
echo ""
echo "=================================="
echo "Starting dev server now..."
echo "=================================="
echo ""

# Start the H5 dev server
npm run dev:h5
