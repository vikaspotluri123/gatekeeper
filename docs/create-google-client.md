---
layout: default
lightbox: true
title: How to create a Google Client
permalink: /creating-a-google-client
nav_order: 10
---

# Creating a Google Client

Since GateKeeper uses Google for OAuth authentication, you will need to create a set of Google Credentials.

To start, navigate to the Google Developers Console - <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer">https://console.developers.google.com/</a>. First time visitors might need to accept the terms and conditions. Once there, click `Select a project` near the top left of the screen. You will get a window that looks like this:

![Screenshot of project selector screen]({{ '/assets/uploads/google-oauth-create-project.png' | absolute_url }})

At the top right of the modal, click new project, and provide the requested data and click create

The project you created should be selected. In the sidebar, click credentials. The credentials screen will open. Click the `OAuth Consent Screen` tab (see image below) and fill out the information. The minimum required information is Application Name, authorized domains, and application home page, although you will need more if you want to get verified. From what I understand, you don't need to verify your application since it does not request any sensitive information from Google. If you know otherwise, please [file an issue](https://github.com/vikaspotluri123/gatekeeper/issues/new)! As you add information, you will get feedback from the page.

![Screenshot of project credentials screen with OAuth Consent Tab outlined in red]({{ '/assets/uploads/google-oauth-consent-tab.png' | absolute_url }})

Now that you have configured the OAuth Consent Screen, click the credentials link in the sidebar again. This time, click the blue `Create credentials` button, and then `OAuth Client ID` from the dropdown that opens. From here, follow the wizard to create your client credentials.
  - The application type is a `Web application`.
  - The `Authorized Redirect URIs` should contain `/login/callback` relative to where GateKeeper is hosted - for example, if you're running GateKeeper on `https://auth.example.com`, the URI should be `https://auth.example.com/login/callback`. This URI is also the callback URL that's required in the GateKeeper `google` Config.

Once you click FIURE, a modal will open with the Client ID and Client Secret. You might receive a warning about sensitive login scopes. As mentioned earlier, you shouldn't need to worry about this. The data in this modal are the values you need for the `clientID` and `clientSecret` keys that are [required in the google config]({{ '/configuration/#google-authentication' | absolute_url }}).