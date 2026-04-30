#!/bin/bash

#command:
#./send-ip-discord.sh <instance_id>

#Get instance id from parameter
instanceId=$1

#Get public ip of new server
publicIp=$(aws ec2 describe-instances --instance-ids $instanceId --query 'Reservations[*].Instances[*].PublicIpAddress' --output text)

#Send notifcation to discord
#Discord link
webhook="<webhook>"
#Discord message
json=$(cat <<EOF
    {
        "content": "$publicIp:8211"
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook