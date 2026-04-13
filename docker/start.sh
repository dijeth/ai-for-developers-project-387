#!/bin/sh
set -e

# Hugging Face Spaces uses /data for persistent storage
# Create data directory and ensure proper permissions
mkdir -p /data
chmod 777 /data

# Create symlink from apps/api/data to /data for compatibility
ln -sf /data /app/apps/api/data 2>/dev/null || true

echo "Data directory setup: /data (persistent storage)"

# Setup SQLite database if doesn't exist or is empty
DB_FILE="/data/prod.db"
DB_SIZE=$(stat -c%s "$DB_FILE" 2>/dev/null || echo "0")

if [ ! -f "$DB_FILE" ] || [ "$DB_SIZE" -lt 100 ]; then
    echo "Initializing SQLite database..."
    # Remove empty/corrupt file if exists
    rm -f "$DB_FILE"
    cd /app/apps/api
    npx prisma db push --accept-data-loss || true
    npm run db:seed 2>/dev/null || true
    echo "Database initialized at $DB_FILE"
fi

# Verify database exists and has data
DB_SIZE=$(stat -c%s "$DB_FILE" 2>/dev/null || echo "0")
if [ -f "$DB_FILE" ] && [ "$DB_SIZE" -gt 100 ]; then
    echo "Database verified at $DB_FILE (size: $DB_SIZE bytes)"
    ls -la /data/
else
    echo "WARNING: Database file is missing or too small ($DB_SIZE bytes)"
fi

# Start backend in background
echo "Starting backend API on port 3001..."
cd /app/apps/api
node dist/src/main &
API_PID=$!

# Wait a moment for backend to initialize
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! kill -0 $API_PID 2>/dev/null; then
    echo "ERROR: Backend failed to start"
    exit 1
fi

echo "Backend started successfully (PID: $API_PID)"

# Start nginx in foreground on port 7860 (Hugging Face Spaces standard port)
echo "Starting nginx on port 7860..."
nginx -g 'daemon off;'
