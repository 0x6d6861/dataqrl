#!/bin/sh

# Start nginx in background
nginx

# Start backend services
cd /app/backend

# Start upload service
node dist/services/upload/server.js &

# Start processing service
node dist/services/processing/server.js &

# Start events service
node dist/services/events/server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?