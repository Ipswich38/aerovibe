#!/bin/bash
# Waevpoint — One-shot OpenDroneMap setup
# Installs Docker (if needed) and pulls NodeODM image.
# After this, photogrammetry processing works from /ops/surveys.

set -e

echo "=== Waevpoint ODM Setup ==="
echo ""

# Step 1: Docker
if command -v docker &>/dev/null; then
  echo "✓ Docker already installed: $(docker --version)"
else
  echo "→ Installing Docker via Homebrew (this takes a few minutes)..."
  brew install --cask docker
  echo "→ Docker installed. Opening Docker Desktop..."
  open -a Docker
  echo ""
  echo "⏳ Waiting for Docker to start (first launch takes 1-2 minutes)..."
  while ! docker info &>/dev/null 2>&1; do
    sleep 3
    printf "."
  done
  echo ""
  echo "✓ Docker is running"
fi

# Make sure Docker daemon is running
if ! docker info &>/dev/null 2>&1; then
  echo "→ Docker installed but not running. Starting Docker Desktop..."
  open -a Docker
  echo "⏳ Waiting for Docker daemon..."
  while ! docker info &>/dev/null 2>&1; do
    sleep 3
    printf "."
  done
  echo ""
  echo "✓ Docker is running"
fi

# Step 2: Pull NodeODM
echo ""
echo "→ Pulling OpenDroneMap NodeODM image (~2GB, one-time download)..."
docker pull opendronemap/nodeodm:latest
echo "✓ NodeODM image ready"

# Step 3: Create launch script
LAUNCH_SCRIPT="$(dirname "$0")/start-odm.sh"
cat > "$LAUNCH_SCRIPT" << 'LAUNCH'
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
LAUNCH
chmod +x "$LAUNCH_SCRIPT"

# Step 4: Create stop script
STOP_SCRIPT="$(dirname "$0")/stop-odm.sh"
cat > "$STOP_SCRIPT" << 'STOP'
#!/bin/bash
docker stop waevpoint-nodeodm 2>/dev/null && echo "✓ NodeODM stopped" || echo "NodeODM not running"
STOP
chmod +x "$STOP_SCRIPT"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Usage:"
echo "  Start ODM:  ./scripts/start-odm.sh"
echo "  Stop ODM:   ./scripts/stop-odm.sh"
echo ""
echo "Then add to your Vercel env (or .env.local):"
echo "  NODEODM_URL=http://localhost:3000"
echo ""
echo "Workflow:"
echo "  1. Plan polygon survey mission in /ops/missions (MAP-2 preset)"
echo "  2. Fly the mission with DJI Fly, collect photos"
echo "  3. Drop photos in ~/drone-jobs/<client>/photos/"
echo "  4. Create survey in /ops/surveys → hit Process"
echo "  5. Output (orthomosaic, DSM, 3D mesh) appears in survey when done"
echo ""
