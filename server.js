// JavaScript source code
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const url = "mongodb+srv://Pushp:pushp@a-mad-cluster.1u5jl.mongodb.net/API?retryWrites=true&w=majority";
const severities = ['none', 'mild', 'mild', 'moderate', 'severe']
const jwt = require('jsonwebtoken');

const salt = bcrypt.genSaltSync(10);
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

//Status encoded
const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const CONFLICT = 403;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

var authMiddleware = function (req, res, next) {
    try {
        if (!req.headers.authorizationkey) {
            res.status(UNAUTHORIZED).send("UNAUTHORIZED");
        } else {
            var decode = jwt.decode(req.headers.authorizationkey);
            jwt.verify(req.headers.authorizationkey, 'secret', function (err, decoded) {
                if (err) {
                    console.log(err);
                    res.status(BAD_REQUEST).send(err.message);
                } else {
                    if (decoded.u_id == decode.u_id) {
                        req.encode = decoded.u_id;
                        next();
                    } else
                        console.log("fail");
                }
            });
        }
    } catch (err) {
        res.send(err);
    }
}

app.post('/sms', (req, res) => {
    console.log(req.body);
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
                    twiml.message('You have already enrolled, you may not enroll again.');

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

// admin login with password encyption check
app.post('/v1/admin/login', function (req, res) {
    if (typeof req.body.email === "undefined" || typeof req.body.password === "undefined") {
        res.status(BAD_REQUEST).send("Bad request Check request Body");
    } else {
        client = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        client.connect().then(() => {
            var myObj = {
                emailId: req.body.email,
            };
            client.db('Twilio').collection('Admin').findOne(myObj, function (err, result) {
                if (err)
                    res.status(INTERNAL_SERVER_ERROR).send(err);
                else if (result == null)
                    res.status(OK).send("No such user found");
                else if (result != null && bcrypt.compareSync(req.body.password, result.password)) {
                    var token = jwt.sign({
                        u_id: result._id
                    }, 'secret', {
                        expiresIn: 60 * 60
                    });
                    res.header("AuthorizationKey", token).status(OK).send("Login Successful");
                }
                else {
                    res.status(OK).send("Invalid Credentials");
                }
                return client.close();
            })
        });
    }
});

// admin signup encyption check
app.post('/v1/admin/signup', function (req, res) {

    if (typeof req.body.email === "undefined" || typeof req.body.password === "undefined") {
        res.status(BAD_REQUEST).send("Bad request Check request Body");
    } else {
        client = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const hash = bcrypt.hashSync(req.body.password, salt);
        client.connect().then(() => {
            var myObj = {
                emailId: req.body.email,
                password: hash
            };
            client.db('Twilio').collection('Admin').insertOne(myObj, function (err, result) {
                if (err)
                    res.status(INTERNAL_SERVER_ERROR).send(err);
                else if (result.insertedCount == 1) {
                    res.status(OK).send("Signed up Successfully");
                    console.log(result.insertedId);
                }
                return client.close();
            })
        });
    }
});

//get all enrolled users
app.get('/v1/users',authMiddleware, function (req, res) {
        client = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        client.connect().then(() => {
            client.db('Twilio').collection('SMS').find({}).toArray(function (err, result) {
                if (err)
                    res.status(INTERNAL_SERVER_ERROR).send(err);
                else if (result == null)
                    res.status(OK).send("No Users enrolled till now");
                else if (result != null) {
                    res.status(OK).send(result);
                }
                return client.close();
            })
        });
    
});

//get all enrolled users
app.delete('/v1/user', authMiddleware, function (req, res) {
    var myquery = {
        _id: req.body.subscriber_id
    };
    var newvalues = {
        $set: {
            "user.status": "Deleted"
        }
    };
    client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    client.connect().then(() => {
        client.db('Twilio').collection('SMS').updateOne(myquery, newvalues, {
            upsert: true
        }, function(err, result) {
            if (err)
                res.status(INTERNAL_SERVER_ERROR).send(err);
            else if (result == null)
                res.status(OK).send("No such User found");
            else if (result != null) {
                res.status(OK).send("User deleted Successfully");
            }
            return client.close();
        })
    });

});

app.get('/v1/token/check', authMiddleware, function (req, res) {
    res.status(OK).send("Token is valid");
})

//const port = 1337;//1337;
const port = 5000;//1337;
http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});