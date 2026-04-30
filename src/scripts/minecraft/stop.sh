#!/bin/bash
# Stops the Minecraft server process on the game server EC2 instance.
# Runs via AWS SSM — do not call directly.
# Replace <service-name> with your systemd service name (e.g. minecraft-server).

set -euo pipefail

systemctl stop <service-name>
