#!/bin/bash

#command:
#./backup-message.sh

#send notifcation to discord
#discord link
webhook="<webhook>"
#discord message
json=$(cat <<EOF
    {
        "content": "Stopping server for backup..."
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook