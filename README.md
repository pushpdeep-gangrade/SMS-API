# SMS-API

# Table of Contents
- [Authors](#authors)
- [App Mockup](#mockup)

### Intro- Update!!
Project due date: 11/4/2020 at 10pm

## Running the App
1. Admin side:
   - Run `npm install` in the `SMS-API` directory to install node.js libraries
   - Set up twilio and the twilio CLI: `npm install twilio` and `npm install twilio-cli -g`
   - Login to twilio using your SID and auth token: 
     - TODO add exact command 
     - Helpful tip: Create a local .env file in the `SMS-API` directory with your SID and auth token

   - Attach webhook by executing
     `twilio phone-numbers:update "+12013792669" --sms-url="http://localhost:1337/sms`
2. User side: Start a conversation by sending a message to [`+1-201-379-2669`](tel:12013792669)
   - TODO: specify user start text

### App Features (requirements, cross off when done)

- In this assignment you will create a server application that allows the sending of SMS messages to the user and to create a conversation with the user. The app should be based on the Twilio API (https://www.twilio.com). The requirements are as follows:
@@ -105,12 +121,15 @@ Project due date: 11/4/2020 at 10pm
- You should be able to un-enroll/delete a previously enrolled user.


### Submission should include:
### Submission should include (cross off when done):

- ~~Create a Github or Bitbucket repo for the assignment.~~
- ~~Push your code to the created repo. Should contain all your code.~~
- On the same repo create a wiki page describing your api design and implementation. The wiki page should describe the API routes, DB Schema and all the assumptions required to provide authentication. In addition describe any data that is stored on the device or on the server.
- On the same repo create a wiki page describing your api design and implementation.
  The wiki page should describe the API routes, DB Schema and all the assumptions required
  to provide authentication. In addition describe any data that is stored on the device or on the server.
- Include the Postman file in the repo.
- If you used custom APIs you should demo your API using the Postman Chrome Plugin. The API should be demonstrated using Postman, you should create an api component in Postman for each of your created APIs.
- If you used custom APIs you should demo your API using the Postman Chrome Plugin. The API should be
  demonstrated using Postman, you should create an api component in Postman for each of your created APIs.
- Demo your API using a mobile app that uses your implemented api.
- A 5 minute (max) screencast to demo your application.