# SMS-API

# Table of Contents
- [Authors](#authors)
- [App Mockup](#mockup)
- [Video Demo](#demo)
- [Project Wiki](#wiki)

## Authors <a name="authors"></a>
- Pushpdeep Gangrade
- Katy Mitchell
- Valerie Ray
- Rockford Stoller
   
## App Mockup <a name="mockup"></a>
 - View [part 1](https://github.com/pushpdeep-gangrade/SMS-API/mockup_part1.png) and [part 2](https://github.com/pushpdeep-gangrade/SMS-API/blob/master/mockup_part1.png) of the mockup here.

## Video Demo <a name="demo"></a>
- App Demo: https://youtu.be/DUkRFxmzfQ0

## Project Wiki <a name="wiki"></a>

### Running the App
1. Admin side:
   - The first time the app is run, start with installing npm libraries 
    -  Run `npm install`, `npm install twilio` and `npm install twilio-cli -g`. Make sure to have root access for these commands to succeed.
   - Once the CLI is installed, login to twilio using your SID and auth token: 
     - TODO add exact command 
     - Helpful tip: Create a local .env file in the `SMS-API` directory with your SID and auth token
   - Lastly, attach webhook by executing
     `twilio phone-numbers:update "+12013792669" --sms-url="http://localhost:1337/sms`
2. User side: Start a conversation by sending `Start` to [`+1-201-379-2669`](tel:12013792669). The system
   will reply with an enrollment message than start asking about symptoms.

### App Features
We have created a server application that allows the sending of SMS messages to the user to create a conversation. The app is based on the Twilio API (https://www.twilio.com). The requirements are as follows:
- The user is able to enroll in the app by texting `START` to +1(201)-379-2669.
  - The app uses an API to validate that the user is not re-enrolled if already enrolled in the app. It sends a SMS message saying `You have already been enrolled, you may not enroll again` to the user if they attempt to re-enroll.
  - Upon enrolling in the app for the first time, the user is sent the message "Welcome to the study".
- Step 1:
  - After enrolling in the study the user is sent the following message: "Please indicate your symptom (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness, (0)None"
  - The user is only allowed to enter a number 0-5.
  - If the user enters an invalid message (not 0-5), they are sent the message `Please enter a number from 0 to 5`.
  - If the user enters 0, then them the message `Thank you and we will check with you later.` is sent and  messaging ends for this user.
- Step 2: Assuming the user did not enter 0 in Step 1. After answering the symptom selection message the user should be asked to rank their symptom `On a scale from 0 (none) to 4 (severe), how would you rate your xxxx in the last 24 hours?`, where `xxxx` is the symptom they selected in the first message.
  - The user is only allowed to enter a number 0-4. If the user sends a message not in this range, the app sends the message `Please enter a number from 0 to 4`
- Step 3: After answering the rating question the user is sent a followup message based on the rating level they selected:
  - if 1 or 2 : `You have a mild xxxx` 
  - if 3 : `You have a moderate xxxx` 
  - if 4 : `You have a severe xxxx` 
  - if 0 : `You do not have a xxxx`
- After answering the rating question Step 1 is repeated, with the symptom question sent to the user a maximum of 3 times. The choices that were selected previously by the user are removed. For example, if the user picked Headache as a symptom, then the message is: `Please indicate your symptom (1)Dizziness, (2)Nausea, (3)Fatigue, (4)Sadness, (0)None`
- After the third time the following message is sent to the user : `Thank you and see you soon`

### Admin Portal:

- The apo uses Twilio WebHooks and a database to store the state of the user.
- Only an admin user can access the admin portal.
- The portal shows a list of enrolled participants
- Phone number, enrollment date, and symptoms reported with their ranking for each user.
- The admin can un-enroll/delete a previously enrolled user.