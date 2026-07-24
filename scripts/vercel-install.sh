#!/bin/bash
# Vercel install script - works regardless of CWD
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Project root: $ROOT"

echo "Installing backend dependencies..."
cd "$ROOT/backend" && npm install

echo "Installing frontend dependencies..."
cd "$ROOT/frontend" && npm install

echo "Install complete!"
