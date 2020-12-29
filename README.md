# Twilio bot for uploading to Google albums
This twilio bot that takes text message images and uploads them directly to a google photos album through a Typescript API hosted on AWS Lambda

## Setup
A project needs to be created in Google cloud beforehand. A refresh token also needs to be generated for an Oauth client in the project space. 
I was able to generate the refresh token programatically (in a separate project space) using "google-auth-library" for NodeJS. In a nutshell, 
the generateAuthUrl method for an Oauth2Client generates a verification screen, which gives an authorization code. The getToken method can then 
turn that into a refresh token. 

The permission scopes required are:

    https://www.googleapis.com/auth/photoslibrary.sharing
    https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata
    https://www.googleapis.com/auth/photoslibrary

## Requirements
The app requires a .env file with several user-specific authentication variables/tokens declared
#### TWILIO_ACCOUNT_SID
The account SID for logging in
#### TWILIO_AUTH_TOKEN
The authentication token for your Twilio account
#### PHONE_NUMBERS
Verified phones numbers that should be allowed to upload pictures. Each number should be separated by '::' and preceded by the country code. 
Example: ```+11234567890::+14445556666::+19998887777```
#### TWILIO_NUMBER
The SMS number registered under Twilio.
#### ALBUM_ID
The album id that Google photos should be using. This album has to be created programatically with a flag of ```isWriteable: true```. For more
information on creating a Google album programatically, see: https://developers.google.com/photos/library/reference/rest/v1/albums/create and https://developers.google.com/photos/library/reference/rest/v1/albums
#### REFRESH_TOKEN
Your Google OAUTH 2.0 refresh token. This is so the app can regenerate a bearer token for each usage. Each bearer token only lasts for 6 hours 
according to Google's documentation. 
#### CLIENT_ID
The client ID associated with your OAUTH 2.0 client set up in Google Cloud.
#### CLIENT_SECRET
The client secret associated with your OAUTH 2.0 client set up in Google Cloud.

## Running the API
That's it! To deploy to AWS Lambda, first make sure you are logged in to the AWS CLI, then ```serverless deploy```.
