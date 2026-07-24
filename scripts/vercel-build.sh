#!/bin/bash
# Vercel build script - works regardless of CWD
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Project root: $ROOT"

echo "Building frontend..."
cd "$ROOT/frontend" && npm run build

echo "Build complete!"
