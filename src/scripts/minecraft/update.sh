#!/bin/bash
# Updates the Minecraft server jar.
# Runs via AWS SSM — do not call directly.
# Replace placeholders:
#   <server-dir>  — directory containing server.jar, e.g. /home/minecraft/server/
#   <jar-url>     — download URL for the target server jar version

set -euo pipefail

cd <server-dir>
curl -o server.jar <jar-url>
echo "Update complete at $(date)"
