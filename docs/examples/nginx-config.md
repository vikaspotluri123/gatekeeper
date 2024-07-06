---
layout: default
title: NGINX Configuration
nav_order: 2
parent: Examples
description: Learn how to integrate GateKeeper and NGINX by exploring an example configuration
permalink: /examples/nginx
---

GateKeeper was designed with NGINX subrequest authentication in mind. Here's a sample NGINX configuration

{% comment %} If you know how to include data from the parent directory, please let me know! {% endcomment %}

```nginx
# Check out the nginx subrequest docs!
# https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/
server {
	listen 443 ssl http2;
	listen [::]:443 ssl http2;

	server_name example.com;

	ssl on;
	ssl_certificate /path/to/cert.cer;
	ssl_certificate_key /path/to/key.cer;

	root /var/www/example;
	index index.php index.html;

	access_log /var/log/nginx/example.access.log;
	error_log /var/log/nginx/example.error.log;

	location / {
		# Everyone has access!
		try_files $uri $uri/ =404;
	}

	location /proxy-to-server {
		# Example of required auth that proxies
		error_page 401 @login;
		auth_request @auth;
		auth_request_set $auth_cookie $upstream_http_set_cookie;
		add_header "Set-Cookie" $auth_cookie;

		proxy_pass http://127.0.0.1:2591;
		include proxy_params;
	}

	location /protected {
		# Example of required auth with "static" files
		error_page 401 @login;
		auth_request @auth;
		auth_request_set $auth_cookie $upstream_http_set_cookie;
		add_header "Set-Cookie" $auth_cookie;
	}

	location ~ \.php$ {
		try_files $uri =404;
		fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
		include fastcgi_params;
	}

	location = @auth {
		internal;
		proxy_pass http://127.0.0.1:2590/api/v1/http/;
		proxy_pass_request_body off;
		proxy_set_header  Content-Length "";
		proxy_set_header  X-Original-URI $scheme://$host$request_uri;
		proxy_set_header  origin $http_host;
	}

	location @login {
		return 302 https://auth.example.com/api/v1/authenticate?redirect=https://example.com/login;
	}
}
```
