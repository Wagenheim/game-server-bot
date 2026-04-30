#!/bin/bash

#Command:
#./stop-palworld-instance.sh <instance_id>

#Get instance id from parameter
instanceId=$1

#Get current time for logs
timeNow=$(date)

#Stop instance
aws ec2 stop-instances --instance-ids $instanceId

#log time
echo "stopped $instanceId at $timeNow" >> ~/instance_log.txt

#Send notifcation to discord
#Discord link
webhook="<webhook>"
#Discord message
json=$(cat <<EOF
    {
        "content": "Server has been shut down for the night. Expected to be back online at ..."
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook