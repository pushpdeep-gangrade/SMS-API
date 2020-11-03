import React, { Component } from 'react';
import { Participants } from '../components/Participants';


export class ParticipantsContainer extends Component {
    static displayName = ParticipantsContainer.name;

    constructor(props) {
        super(props);

        console.log(this.props.cookies.get('authorizationToken'));

        this.state = {
            participantsList: [],
            authToken: this.props.cookies.get('authorizationToken'),
            currentParticipant: null,
            showSymptoms: false
        };

        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.populateParticipantsTable = this.populateParticipantsTable.bind(this);
        this.handleSymptomsClick = this.handleSymptomsClick.bind(this);
    }

    async componentDidMount(){
        await this.props.checkValidToken(this.state.authToken);

        this.populateParticipantsTable();
    }

    async populateParticipantsTable(){

        let response = await fetch('/v1/users', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'AuthorizationKey': this.state.authToken
            },
        });

        let data = await response.json()

        console.log(data);

        this.setState({
            participantsList: data
        })

    }

    async handleDeleteClick(event, position) {
        event.preventDefault();

        //Test Delete
        /*
            {
                "_id": "+1234567890",
                "enrolldate": 2020-10-31T18:11:21.680+00:00,
                "user": {
                            "status": "Enrolled",
                            "disease": [
                            {
                                "name": "Headache",
                                "severity": 2
                            },
                            {
                                "name": "Sadness",
                                "severity": 3
                            },
                            {
                                "name": "Fatigue",
                                "severity": 1
                            }
                            ]
                        }
            }
        */

        let deleteUser = this.state.participantsList[position];

        let body = {
            subscriber_id: deleteUser._id
        }

        let response = await fetch('/v1/user', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'AuthorizationKey': this.state.authToken
            },
            body: JSON.stringify(body)
        });

       await this.populateParticipantsTable();

       if(this.state.currentParticipant !== null && deleteUser !== null &&
        typeof this.state.currentParticipant !== "undefined" && typeof deleteUser !== "undefined"){
        if(this.state.currentParticipant._id === deleteUser._id){
            this.setState({
                currentParticipant: null
            })
        }
       }
      
    }

    handleSymptomsClick(event, position){
        let participant = this.state.participantsList[position];

        console.log(participant)

        this.setState({
            currentParticipant: participant,
            showSymptoms: true
        })

    }

  
    render() {
        return (
            <div>
                <Participants 
                    participantsList={this.state.participantsList} 
                    onDeleteClick={this.handleDeleteClick} 
                    showSymptoms={this.state.showSymptoms}
                    currentParticipant={this.state.currentParticipant}
                    onSymptomsClick={this.handleSymptomsClick}
                />
            </div>
        );
    }
}
