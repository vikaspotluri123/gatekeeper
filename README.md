# auth.vikaspotluri.ml

This is the code that runs behind [auth.vikaspotluri.ml](https://auth.vikaspotluri.ml). It's meant to be an extremely simple yet useful Google-based authentication mechanism to validate users before giving them protected access.

This package is intended to be used in conjuction with a webserver (specifically nginx) as a replacement for HTTP Basic Authentication. The biggest goal is to make authentication simpler and easier for the end user over a wide array of endpoints

Goals
- Create a secure, transparent backend for authenticating users
- Provide an interface (although it won't be a GUI) to easily manage access levels
- Complex-database free (data is stored in a JSON file)
-- This was done explicitly for simplicity. Adding a database adds expontential development overhead as well as a decent amount of work for deployment
- Interface with multiple clients (specifically via REST and HTTP Status Codes)

This project is not complete; more documention will become available as v0.1.0 becomes available. 
