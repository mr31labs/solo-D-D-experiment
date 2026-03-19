#!/bin/bash
cd "$(dirname "$0")"
echo "Starting local game server..."
python3 -m http.server 8000 &
sleep 1
open http://localhost:8000
echo "Server running at http://localhost:8000 (Close this window to keep it running, or press Ctrl+C to stop it if run from terminal)"
