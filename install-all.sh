#!/bin/bash
# Install all dependencies (frontend + backend)

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ All dependencies installed!"
