#!/bin/bash
# Start NodeODM for photogrammetry processing.
# Photos go in ~/drone-jobs/<client>/photos/ → processed outputs appear there.

CONTAINER_NAME="waevpoint-nodeodm"
PORT=3000

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "✓ NodeODM already running on port $PORT"
  echo "  Dashboard: http://localhost:$PORT"
  exit 0
fi

# Remove stopped container if exists
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "→ Starting NodeODM on port $PORT..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:3000" \
  -v "$HOME/drone-jobs:/var/www/data" \
  --restart unless-stopped \
  opendronemap/nodeodm:latest

echo "✓ NodeODM running"
echo "  API: http://localhost:$PORT"
echo "  Jobs folder: ~/drone-jobs/"
echo ""
echo "To stop: docker stop $CONTAINER_NAME"
echo "To view logs: docker logs -f $CONTAINER_NAME"
