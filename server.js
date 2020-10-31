// JavaScript source code
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://Pushp:pushp@a-mad-cluster.1u5jl.mongodb.net/API?retryWrites=true&w=majority";
const severities = ['none','mild','mild','moderate','severe']

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//Status encoded
const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const CONFLICT = 403;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();
    //console.log(req.body);

    client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    if (req.body.Body.toLowerCase() == "start") {
        //If enrolling
        client.connect().then(() => {
            var myObj = {
                _id: req.body.From,
            };
            client.db('Twilio').collection('SMS').findOne(myObj).then(result => {
                //console.log("result: " + result);
                if (result != null) {
                    //User with this number is found
                    //So determine state and proper actions
                    twiml.message('You have already, you may not enroll again.');

                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(twiml.toString());
                    return client.close();
                }
                else  {
                    //Else no user with this number found
                    //So create user and start questioning
                    let date = new Date();
                    var objToStore = {
                        _id: req.body.From,
                        diseases: ["None","Headache","Dizziness","Nausea","Fatigue","Sadness"],
                        user: {
                            status: "Subscribed",
                            step: "D",
                            index: 0,
                            disease: []
                        },
                        enrolldate: date
                    };
                    //console.log(objToStore);
                    client.db('Twilio').collection('SMS').insertOne(objToStore, function (err, result1) {
                        //console.log(result1);
                        if (err) {
                            res.status(INTERNAL_SERVER_ERROR).send(err);
                            //console.log(err);
                        }
                        else if (result1.insertedCount == 1) {
                            twiml.message('Welcome to the study');

                            twiml.message('Please indicate your symptom (0)None, (1)Headache, (2)Dizziness, (3)Nausea, (4)Fatigue, (5)Sadness');

                            res.writeHead(200, { 'Content-Type': 'text/xml' });
                            res.end(twiml.toString());

                            //console.log(result1.insertedId);
                        }

                        return client.close();
                    });
                }
            })
        });
    }
    else {
        //Else not enrolling
        client.connect().then(() => {
            var myObj = {
                _id: req.body.From,
            };
            client.db('Twilio').collection('SMS').findOne(myObj).then(result => {
                //console.log("result: " + result);
                if (result == null) {
                    //No user with this number is found
                    //So inform how to enroll
                    twiml.message('Send START to enroll.');

                    res.writeHead(200, { 'Content-Type': 'text/xml' });
                    res.end(twiml.toString());
                    return client.close();
                }
                else  {
                    //Else user with this number found
                    //So determine status and next message to send
                    if (result.user.step == "D") {
                        //if the user is on Disease selection step
                        var symptomResponse = parseInt(req.body.Body)

                        //Number validation check
                        if (symptomResponse > (result.diseases.length-1) || isNaN(symptomResponse)) {
                            twiml.message('Your answer must be a valid number (0-' + (result.diseases.length-1) + ').');

                            res.writeHead(200, { 'Content-Type': 'text/xml' });
                            res.end(twiml.toString());
                            return client.close();
                        }
                        else {
                            //Else number is valid
                            if (symptomResponse == 0) {
                                //if no symptom
                                var myquery2 = {
                                    _id: req.body.From,
                                };
                                var newvalues2 = {
                                    $set: {
                                        "user.status": "Completed",
                                    },
                                };
                                client.db('Twilio').collection('SMS').updateOne(myquery2, newvalues2, {
                                    upsert: true
                                }, function(err2, up_result2) {
                                    if (err2) {
                                        res.status(INTERNAL_SERVER_ERROR).send(err2);
                                    }
                                    else {
                                        twiml.message('Thank you and we will check with you later.');

                                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                                        res.end(twiml.toString());
                                        return client.close();
                                    }
                                });
                            }
                            else {
                                var myquery = {
                                    _id: req.body.From,
                                };
                                var newvalues = {
                                    $pull: {
                                        diseases: result.diseases[symptomResponse],
                                    },
                                    $set: {
                                        "user.step": "S",
                                    },
                                    $addToSet: {
                                        "user.disease": {
                                            "name": result.diseases[symptomResponse],
                                            "severity": null,
                                        }
                                    }
                                };
                                client.db('Twilio').collection('SMS').updateOne(myquery, newvalues, {
                                    upsert: true
                                }, function(err, up_result) {
                                    //console.log(result)
                                    if (err) {
                                    res.status(INTERNAL_SERVER_ERROR).send(err);
                                    } else {
                                        twiml.message('On a scale from 0 (none) to 4 (severe), how would you rate your ' + result.diseases[symptomResponse] + ' in the last 24 hours?');

                                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                                        res.end(twiml.toString());
                                    }
                                    return client.close();
                                });
                            }
                        }
                    }
                    else {
                        //else serverity selection step
                        var severityResponse = parseInt(req.body.Body)

                        //Number validation check
                        if (severityResponse > (severities.length-1) || isNaN(severityResponse)) {
                            twiml.message('Your answer must be a valid number (0-' + (severities.length-1) + ').');

                            res.writeHead(200, { 'Content-Type': 'text/xml' });
                            res.end(twiml.toString());
                            return client.close();
                        }
                        else {
                            //Else number is valid
                            var myquery = {
                                _id: req.body.From,
                                "user.disease.name": result.user.disease[result.user.index].name,
                            };
                            var newvalues = {
                                $set: {
                                    "user.step": "D",
                                    "user.disease.$.severity": severityResponse,
                                },
                                $inc: {
                                    "user.index": 1,
                                },
                            };
                            client.db('Twilio').collection('SMS').updateOne(myquery, newvalues, {
                                upsert: true
                            }, function(err, up_result) {
                                //console.log(result)
                                if (err) {
                                  res.status(INTERNAL_SERVER_ERROR).send(err);
                                } else {
                                    twiml.message('You have a ' + severities[severityResponse] + ' ' + result.user.disease[result.user.index].name + '.');

                                    if ((result.user.disease.length) < 3) {
                                        //If still less than 3 symptoms recorded
                                        var disStr = ''
                                        for (const [i, v] of result.diseases.entries()) {
                                            if (i == 0) {
                                                disStr = disStr + ' (' + (i) + ')' + v
                                            } else {
                                                disStr = disStr + ', (' + (i) + ')' + v
                                            }
                                        }
                                        twiml.message('Please indicate your symptom' + disStr + '.');
                                        res.writeHead(200, { 'Content-Type': 'text/xml' });
                                        res.end(twiml.toString());
                                        return client.close();
                                    } else {
                                        //else max symptoms recorded
                                        var myquery2 = {
                                            _id: req.body.From,
                                        };
                                        var newvalues2 = {
                                            $set: {
                                                "user.status": "Completed",
                                            },
                                        };
                                        client.db('Twilio').collection('SMS').updateOne(myquery2, newvalues2, {
                                            upsert: true
                                        }, function(err2, up_result2) {
                                            if (err2) {
                                                res.status(INTERNAL_SERVER_ERROR).send(err2);
                                            }
                                            else {
                                                twiml.message('Thank you and see you soon.');
                                                res.writeHead(200, { 'Content-Type': 'text/xml' });
                                                res.end(twiml.toString());
                                                return client.close();
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            })
        });
    }
});

const port = 3000;//1337;
http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});