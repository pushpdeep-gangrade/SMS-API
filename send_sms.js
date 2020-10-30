// JavaScript source code

require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'This is test message.',
        from: '+12013792669',
        to: '+19803183948'
    })
    .then(message => console.log(message.sid));
