---
layout: default
title: Configuration
nav_order: 3
permalink: /configuration
---

# Configuration

GateKeeper requires a few configuration options to be functional. Here's the configuration schema:

The required keys are: `google`

```js
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
## Google Authentication

**This option is required**

- key: google
- description: Credentials and configuration used to make Google OAuth work
- properties:
  - `clientID` - The Client ID from Google
  - `clientSecret` - The Client Secret from Google
  - `callbackURL` - The URL that Google will redirect to. This should be {url}/login/callback
- See also: [Creating a Google client]({{ '/creating-a-google-client' | absolute_url }})

## Application Name

This key is optional

- key: name
- description: The name of your application. This is not required, but it's used in the title and heading of auth pages
- default: Shared Authentication

## Cookie Name

This key is optional

- key: cookie
- description: The name of the cookie that stores session information.
- default: private.auth.sid

## Cookie Age

This key is optional

- key: cookieAge
- description: The max-age of the session cookie in milliseconds
- default: 1000 * 60 * 60 * 24 * 7 (1 week)

## Port

This key is optional

- key: port
- description: The port express should listen on
- default: 3000

## Admins

This key is optional

- key: admins
- description: A list of users (email addresses) that have elevated permissions. Right now, this just means they can trigger a config refresh
- default: []
- notes: You can provide a string if there is only one admin

## Admin Permissions

This key is optional

- key: allowAdmins
- description: Whether admins have unrestricted access to all domains. If this value is set to true, the `rules` config is ignored for all admins
- default: true

## Configurable Access Rules

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