# Start development environment (runs in background with live reload)
dev:
    #!/usr/bin/env bash
    # Stop and remove old container if exists
    docker stop aegislab-frontend-dev 2>/dev/null || true
    docker rm aegislab-frontend-dev 2>/dev/null || true
    # Build image
    docker build -t aegislab-frontend-dev:latest -f Dockerfile.dev .
    # Run container
    docker run -d \
      --name aegislab-frontend-dev \
      -p 3000:3000 \
      -v "$(pwd)/src:/app/src" \
      -v "$(pwd)/index.html:/app/index.html" \
      -v "$(pwd)/vite.config.ts:/app/vite.config.ts" \
      -v "$(pwd)/tsconfig.json:/app/tsconfig.json" \
      -v "$(pwd)/tsconfig.node.json:/app/tsconfig.node.json" \
      -v /app/node_modules \
      -v /app/client/node_modules \
      --restart unless-stopped \
      aegislab-frontend-dev:latest && \
    echo "✅ Dev container started, visit http://localhost:3000"