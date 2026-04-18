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
    /app/node_modules/.bin/prisma db push --accept-data-loss || true
    /app/node_modules/.bin/tsx /app/apps/api/prisma/seed.ts 2>/dev/null || true
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

# Wait for backend to be ready (polling healthcheck)
echo "Waiting for backend to be ready..."
MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Check if backend process is still running
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "ERROR: Backend process died"
        exit 1
    fi
    
    # Try to connect to health endpoint
    if wget -q -O - http://127.0.0.1:3001/api/owner > /dev/null 2>&1; then
        echo "Backend is ready! (responded with HTTP 200)"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Attempt $RETRY_COUNT/$MAX_RETRIES: Backend not ready yet, waiting..."
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "ERROR: Backend failed to become ready within $MAX_RETRIES seconds"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

echo "Backend started successfully (PID: $API_PID)"

# Start nginx in foreground on port 7860 (Hugging Face Spaces standard port)
echo "Starting nginx on port 7860..."
nginx -g 'daemon off;'
