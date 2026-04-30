#!/bin/bash

#./start-palworld-instance.sh <instance_id>

#Send notifcation to discord
#Discord link
webhook="<webhook>"
#Discord message
json=$(cat <<EOF
    {
        "content": "Staring server..."
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook

#Get instance id from parameter
instanceId=$1

#Get current time for logs
timeNow=$(date)

#Start instance
aws ec2 start-instances --instance-ids $instanceId

#Log start time
echo "started $instanceId at $timeNow" >> ~/instance_log.txt