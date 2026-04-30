#!/bin/bash

#command:
#./palworld-backup-24-h.sh

#write 0 for counter
echo 0 > ./tmp-counter.txt

#wherever the palworld server is stored
palDirectory="<path_to_steam>/Steam/steamapps/common/PalServer/"

#find and iterate over files in $palDirectory that have been modified in the last day
find $palDirectory -mtime -1 -print0 | while read -d $'\0' file
do
        #remove some of the file path to prep for upload to S3
        filePath=$(echo "$file" | sed 's/<regex_palworld_steam_directory>//g')

        #find command considers PalServer/ to be modified,
        #so it prints an empty line. This conditinal filters it. 
        if [ -n "$filePath" ]; then

                #find also considers directories to be modified,
                #this conditional filters out directories
                if [[ "$filePath" =~ \.[a-z]*$ ]]; then

                        #increase the counter by one
                        COUNTER=$[$(cat ./tmp-counter.txt) + 1]

                        #upload to S3
                        aws s3 cp $palDirectory$filePath s3://<s3_bucket>/$filePath

                        #write the new counter number
                        echo $COUNTER > ./tmp-counter.txt
                fi

        fi
done

#write to log file
echo "Backed up $(cat ./tmp-counter.txt) files $(date)" >> ./backup-log.txt

#send notifcation to discord
#discord link
webhook="<webhook>"
#discord message
#message = "Backed up X files", X = number of files uploaded 
json=$(cat <<EOF
    {
        "content": "Backed up $(cat ./tmp-counter.txt) files"
    }
EOF
)
curl -H "Content-Type: application/json" -X POST -d "$json" $webhook