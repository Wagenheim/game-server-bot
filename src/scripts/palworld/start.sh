#!/bin/bash
# Starts the Palworld server process on the game server EC2 instance.
# Runs via AWS SSM — do not call directly.
# Replace <service-name> with your systemd service name (e.g. palworld-server).

set -euo pipefail

systemctl start <service-name>
