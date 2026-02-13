#!/bin/bash
# Generate self-signed certificate for Vite HTTPS development server
# This is needed for COOP/COEP headers to work properly

CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

openssl req -x509 -newkey rsa:2048 -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" \
  -days 365 -nodes -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"

echo "Certificates generated successfully in $CERT_DIR"
