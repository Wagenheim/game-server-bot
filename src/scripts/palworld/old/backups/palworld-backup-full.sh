#!/bin/bash

#Command:
#./palword-backup-full.sh

#Get current time for logs
timeNow=$(date)

#Send to S3
aws s3 cp <path_to_steam>/Steam/steamapps/common/PalServer/ s3://<s3_bucket>/ --recursive

#log to file
echo "Fully backed up $timeNow" >> ~/backup-log.txt

#Send notifcation to discord
#Discord link
webhook="<webhook>"
#Discord message
json=$(cat <<EOF
    {
        "content": "Server has been fully backed up."
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook