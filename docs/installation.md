---
layout: default
title: Installation
nav_order: 2
permalink: /install
---

## Installation

GateKeeper requires a minimum node version of 8.15.0. Installation as a standalone application is quite simple:

```bash
# Create the directory to run in
mkdir GateKeeper # Windows users: replace mkdir with md
# cd into the run directory
cd GateKeeper
# Download the latest release
curl -o ./GateKeeper-latest.tar.gz https://github.com/vikaspotluri123/GateKeeper/releases/download/{{TAG}}/GateKeeper-{{TAG}}.zip
# Extract the archive
tar xvf ./GateKeeper-latest.tar.gz
# Install dependencies - Yarn is preferred, but npm will work just as well
# For yarn users:
	yarn install --production
# For NPM users:
	npm install --production
# Copy example configuration
# See the configuration section for required data!
cp config.example.json config.development.json
# Start!
node index.js
```