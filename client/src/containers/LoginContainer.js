import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router';
import { Login } from '../components/Login';


export class LoginContainer extends Component {
    static displayName = LoginContainer.name;

    constructor(props) {
        super(props);

        this.state = {
            successfulLogin: false,
            user: {
                FirstName: "John",
                LastName: "Smith",
                Email: "jsmith@email.com"
              },
            email: "",
            password: ""
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.checkUser = this.checkUser.bind(this);

    }

    handleChange(event) {
        const value = event.target;

        if (value.name === "email") {
            this.setState({
                email: value.value,
            })
        }
        else if (value.name === "password") {
            this.setState({
                password: value.value,
            })
        }
    }

    async checkUser() {
        var body = {
            email: this.state.email,
            password: this.state.password
        }

        const response = await fetch('/v1/admin/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.text();

        console.log(data)

        if (data === "Login Successful") {
            const token = await response.headers.get("AuthorizationKey");
            console.log(token);
            alert(data);
            this.props.setUser(data, token);
            this.setState({ user: data, successfulLogin: true });
        }
        else {
            alert(data);
        }

    }

    handleClick(event) {
        event.preventDefault();

        //Will eventually pull user from the database
        this.checkUser();
        
       /*  this.setState({ successfulLogin: true });
        this.props.setUser(this.state.user, "null") */
    }

  
    render() {
      
        return (
            <div>
                {this.state.successfulLogin === true ? false : <Login onClick={this.handleClick} onChange={this.handleChange} />}
                {this.state.successfulLogin === false ? true : <Redirect
                to={{
                    pathname: "/home",
                    state: { user: this.state.user }
                }}/>}
            </div>
        );
    }
}

export default withRouter(LoginContainer);
