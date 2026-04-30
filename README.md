# Game Server Manager Discord Bot

A TypeScript Discord bot that controls dedicated game servers running on AWS EC2. It uses a pluggable game-adapter architecture, currently shipping with adapters for **Palworld** and **Minecraft**.

## Features

- **Lifecycle control**: start, stop, restart, and check the status of the underlying EC2 instance.
- **Player visibility**: list connected players via game-specific protocols (Palworld REST API, Minecraft RCON).
- **Backups**: archive world/save data to S3 directly from the host using AWS SSM Run Command.
- **Whitelist management** (Minecraft): add, remove, and list whitelisted players over RCON.
- **Auto-shutdown**: scheduled job stops the instance after a configurable idle window with no players online.
- **Game-adapter pattern**: a single bot binary picks the active adapter at startup, so adding a new game is a matter of implementing one interface.

## Architecture

- **Controller** — small EC2 instance running the bot in Docker; outbound-only, no public ports.
- **Game instance** — separate EC2 instance hosting the game server, started/stopped on demand.
- **Remote execution** — AWS SSM Run Command instead of SSH; no inbound ports, no key material on the controller, IAM-scoped via instance tags.
- **RCON** — VPC-internal only, reachable from the controller's security group; never exposed publicly.

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/) on Node.js
- [Discord.js](https://discord.js.org/) for slash commands
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) (`@aws-sdk/client-ec2`, `@aws-sdk/client-ssm`)
- [rcon-srcds](https://www.npmjs.com/package/rcon-srcds) for the Source RCON protocol
- Docker / Docker Compose for deployment

## Bot Commands

- `/start`, `/stop`, `/restart`, `/status` — EC2 lifecycle
- `/ip` — current public address of the running instance
- `/players` — list connected players
- `/backup` — push a world/save archive to S3
- `/whitelist add|remove|list` — Minecraft whitelist management
- `/server` — bot/server info

---

> Built to automate self-hosted multiplayer game servers on cloud infrastructure. Demonstrates AWS SDK v3 usage, agent-based remote execution (SSM), pluggable adapter design, and containerized deployment.
