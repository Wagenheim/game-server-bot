# Palworld Server Manager Discord Bot

A TypeScript-based Discord bot for managing a dedicated Palworld multiplayer server hosted on AWS EC2.

## Features

- **Start / Stop / Restart Server**: Control your EC2-hosted Palworld server from Discord.
- **Get Server IP**: Retrieve the public IP address of the running EC2 instance.
- **List Players**: Display a list of currently connected players.
- **Backup Server Data**: Archive world/save data to an S3 bucket.
- **Auto-Shutdown**: Automatically stop the EC2 instance when no players are connected for a defined time.
- **Scheduled Monitoring**: Background cron jobs check for player activity and manage the server accordingly.

## Technologies Used

- [TypeScript](https://www.typescriptlang.org/)
- [Discord.js](https://discord.js.org/)
- [AWS SDK for JavaScript (v3)](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Node-cron](https://www.npmjs.com/package/node-cron)

## Prerequisites

- AWS account with access to EC2 and S3
- Discord bot token and server
- Node.js (v16+)
- TypeScript configured in your project

## Bot Commands (Example)

- `/start` - Starts the Palworld EC2 server
- `/stop` - Stops the server
- `/restart` - Restarts the server
- `/status` - Fetches the current status of the server
- `/ip` - Returns the public IP of the instance
- `/players` - Lists currently connected players
- `/backup` - Uploads a backup to S3


---

> This bot was built to automate and manage multiplayer server hosting using cloud infrastructure. It showcases real-world use of AWS APIs, server automation, and bot-based interfaces.

