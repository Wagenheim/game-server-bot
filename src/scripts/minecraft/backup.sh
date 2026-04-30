#!/bin/bash
# Backs up Minecraft world files to S3.
# Runs via AWS SSM — do not call directly.
# Replace placeholders:
#   <world-path>  — local path to world data, e.g. /home/minecraft/server/world/
#   <s3-bucket>   — destination bucket, e.g. s3://my-minecraft-backups/world/

set -euo pipefail

aws s3 cp <world-path> <s3-bucket> --recursive
echo "Backup complete at $(date)"
