#!/bin/bash
# Backs up Palworld save files to S3.
# Runs via AWS SSM — do not call directly.
# Replace placeholders:
#   <saves-path>  — local path to PalServer saves, e.g. /home/steam/PalServer/Pal/Saved/
#   <s3-bucket>   — destination bucket, e.g. s3://my-palworld-backups/saves/

set -euo pipefail

aws s3 cp <saves-path> <s3-bucket> --recursive
echo "Backup complete at $(date)"
