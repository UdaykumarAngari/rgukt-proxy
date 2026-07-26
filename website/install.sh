#!/bin/bash

set -e

echo "======================================"
echo " RGUKT Proxy Installer"
echo "======================================"
echo

TMP_DIR=$(mktemp -d)

cd "$TMP_DIR"

echo "Downloading latest package..."

wget -q https://rgukt-proxy.udaykumar-angari.in/downloads/rgukt-proxy.deb

echo "Installing..."

sudo apt update

sudo apt install -y ./rgukt-proxy.deb

echo

echo "Installation completed."

echo

echo "Run:"
echo

echo "    rgukt-proxy"

echo

rm -rf "$TMP_DIR"