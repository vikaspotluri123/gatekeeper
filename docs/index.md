---
layout: default
title: GateKeeper
nav_order: 1
description: "Modern, configurable access control via HTTP Basic Authentication"
permalink: /
---

# GateKeeper
{: .fs-9 }

Modern, configurable access control via HTTP Basic Authentication
{: .fs-6 .fw-300 }

[Installation](#installation){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [GitHub](https://github.com/vikaspotluri123/GateKeeper){: .btn .fs-5 .mb-4 .mb-md-0 }
{: .text-center }

---

GateKeeper is a [node.js](https://nodejs.com) application / library designed to make access control simpler. It provides an easy-to-use API to authenticate a user before providing them access to restricted data.

## How it Works

1. Authentication

	A user is defined by their email address. GateKeeper authenticates a given user by having them log in with Google and storing _only_ the email address. This is stored as session data on the server, and we use cookies to identify individual sessions.

2. Authorization

	Whenever the user tries to access your blog, a sub-request is made to GateKeeper with the URL that is trying to be accessed. GateKeeper determines if the user has permission to access a given resource based on a set of rules you define, and responds with an HTTP response code as well as JSON payload with more information. Based on the response of GateKeeper, the user is shown the content, prompted to log in, or denied access.

	There are 3 HTTP response codes that can be sent:
	- 200 [OK] - The user has permission to access the resource
	- 401 [Unauthorized] - The user has not logged into GateKeeper
	- 403 [Forbidden] - The user does not have permission to access the resource

	<br />

	These codes are also sent as a JSON payload with the following schema:

	```json
	{
		"type": "info",
		"code": 200 | 401 | 403,
		"message": "A user-friendly message describing the code"
	}
	```

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

## Configuration

GateKeeper requires a few configuration options to be functional. Here's the configuration schema:

The required keys are: `google`

```json
{
	"google": {
		"clientID": String,
		"clientSecret": String,
		"callbackURL": URL
	},
	"name": String,
	"cookie": String,
	"cookieAge": Integer,
	"port": Integer,
	"admins": Email | [Email],
	"allowAdmins": Boolean,
	"rules": [{
		"domain": String,
		"paths": [{
			"path": String,
			"allow": Email | [Email]
		}]
	}]
}

```
### Google Authentication

**This option is required**

- key: google
- description: Credentials and configuration used to make Google OAuth work
- properties:
  - `clientID` - The Client ID from Google
  - `clientSecret` - The Client Secret from Google
  - `callbackURL` - The URL that Google will redirect to. This should be {url}/login/callback
- See also: [in progress]

### Application Name

This key is optional

- key: name
- description: The name of your application. This is not required, but it's used in the title and heading of auth pages
- default: Shared Authentication

### Cookie Name

This key is optional

- key: cookie
- description: The name of the cookie that stores session information.
- default: private.auth.sid

### Cookie Age

This key is optional

- key: cookieAge
- description: The max-age of the session cookie in milliseconds
- default: 1000 * 60 * 60 * 24 * 7 (1 week)

### Port

This key is optional

- key: port
- description: The port express should listen on
- default: 3000

### Admins

This key is optional

- key: admins
- description: A list of users (email addresses) that have elevated permissions. Right now, this just means they can trigger a config refresh
- default: []
- notes: You can provide a string if there is only one admin

### Admin Permissions

This key is optional

- key: allowAdmins
- description: Whether admins have unrestricted access to all domains. If this value is set to true, the `rules` config is ignored for all admins
- default: true

### Configurable Access Rules

This key is optional, but this is what makes GateKeeper unique. If you're looking for SSO, check out [vouch](https://github.com/vouch/vouch-proxy)

- key: rules
- description: A list of rules governing how a to determine if a user has access. Rules are evaluated in order, and the first rule to match is used
- default: []
- notes: You can provide an Object instead of an Array if there is only one rule

Single Rule Schema:

```json
{
	"domain": String,
	"paths": Object | [],

}
```