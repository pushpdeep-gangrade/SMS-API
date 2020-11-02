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
        //await this.props.checkValidToken(this.state.authToken);

        this.populateParticipantsTable();
    }

    async populateParticipantsTable(){
        let participantsList = [
            {
                phone: "1234567890",
                date: "October 30th, 2020",
                symptoms: [
                    {
                        symptom: "Headache",
                        rank: 2
                    },
                    {
                        symptom: "Sadness",
                        rank: 3
                    },
                    {
                        symptom: "Fatigue",
                        rank: 1
                    }
                ]
            },
            {
                phone: "4567890123",
                date: "October 31th, 2020",
                symptoms: [
                    {
                        symptom: "Dizziness",
                        rank: 2
                    },
                    {
                        symptom: "Headache",
                        rank: 3
                    },
                    {
                        symptom: "Fatigue",
                        rank: 2
                    }
                ]
            }
        ];

        this.setState({
            participantsList: participantsList
        })

    }

    handleDeleteClick(event, position) {
        event.preventDefault();

        let participantsList = this.state.participantsList;

        participantsList.splice(position, 1)

        this.setState({
            participantsList: participantsList
        })

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
