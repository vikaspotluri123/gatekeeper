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

[Installation]({{'/install' | absolute_url }}){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [GitHub](https://github.com/vikaspotluri123/GateKeeper){: .btn .fs-5 .mb-4 .mb-md-0 }
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
