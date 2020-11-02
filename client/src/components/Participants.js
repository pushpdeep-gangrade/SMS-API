import React, { Component } from 'react';
import { Table } from 'reactstrap';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export class Participants extends Component {
    static displayName = Participants.name;
    

    render() {        
        let items = [];
        let items2 = []

        for (const [index, value] of this.props.participantsList.entries()) {
            let dropDownOptions = (
                <UncontrolledDropdown>
                <DropdownToggle caret>
                  Options
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={(event) => this.props.onSymptomsClick(event,index)}>Show Symptoms</DropdownItem>
                  <DropdownItem onClick={(event) => this.props.onDeleteClick(event,index)}>Unenroll/Delete Participant</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
               )

            items.push(<tr id={value.name}>
                    <td headers="rowNum">{index+1}</td>
                    <td headers="phone">{value._id}</td>
                    <td headers="date">{value.enrolldate}</td>
                    <td headers="dropDown">{dropDownOptions}</td>
                </tr>
             )
        }

        if(this.props.currentParticipant !== null && typeof this.props.currentParticipant !== "undefined"){
            for (const [index, value] of this.props.currentParticipant.user.disease.entries()) {
                let severityText = "";

                if(value.severity === 0){
                    severityText = value.severity + " (" + "None" + ")"
                }
                else if(value.severity === 1){
                    severityText = value.severity + " (" + "Mild" + ")"
                }
                else if(value.severity === 2){
                    severityText = value.severity + " (" + "Mild" + ")"
                }
                else if(value.severity === 3){
                    severityText = value.severity + " (" + "Moderate" + ")"
                }
                else{
                    severityText = value.severity + " (" + "Severe" + ")"
                }

                items2.push(<tr id={this.props.currentParticipant._id}>
                        <td headers="rowNum">{index+1}</td>
                        <td headers="symptom">{value.name}</td>
                        <td headers="rank">{severityText}</td>
                    </tr>
                 )
            }
        }

        let symptomsTable;

        if(this.props.currentParticipant !== null){
            symptomsTable = (
                <div>
                    <br/>
                    <h2>{this.props.currentParticipant._id} Symptoms</h2><br/>
                    <Table>
                        <thead>
                            <tr>
                            <th>#</th>
                            <th>Symptom</th>
                            <th>Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                           {items2}
                        </tbody>
                    </Table><br/>
                </div>
            )
        }
       
        

        return (
            <div>
                <h1>Participants</h1><br/>
                <br/>
                <Table>
                    <thead>
                        <tr>
                        <th>#</th>
                        <th>Phone Number</th>
                        <th>Enrollment Date</th>
                        <th>Choose Options</th>
                        </tr>
                    </thead>
                    <tbody>
                       {items}
                    </tbody>
                </Table>
                {this.props.showSymptoms === false ? true : symptomsTable}
            </div>
        );
    }
}