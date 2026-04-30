#!/bin/bash
# Updates the Palworld dedicated server via SteamCMD.
# Runs via AWS SSM — do not call directly.
# Replace <steamcmd-path> with the path to steamcmd, e.g. /home/steam/steamcmd/steamcmd.sh
# Palworld dedicated server app ID is 2394010.

set -euo pipefail

<steamcmd-path> +login anonymous +app_update 2394010 validate +quit
echo "Update complete at $(date)"
