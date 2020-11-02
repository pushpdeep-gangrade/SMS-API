import React, { Component } from 'react';
import { Redirect, Route } from 'react-router';
import { Layout } from './components/Layout';
import { LoginContainer } from './containers/LoginContainer';
import { ParticipantsContainer } from './containers/ParticipantsContainer';
import { Home } from './components/Home';
import { withCookies } from 'react-cookie';

import './custom.css'

class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            token: this.props.cookies.get('authorizationToken')

        }

        this.setUser = this.setUser.bind(this);
        this.checkValidToken = this.checkValidToken.bind(this);
    }

    async componentDidMount(){
      let token = this.props.cookies.get('authorizationToken')
      await this.checkValidToken(token)
    }

  setUser(user, token) {
    if(token === null){
        this.props.cookies.remove('authorizationToken')
    }
    else{
        this.props.cookies.set('authorizationToken', token, { path: '/' })
    }
      this.setState({
         user: user
      })
  }

  async checkValidToken(token){
    let response = await fetch('/v1/token/check', {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'AuthorizationKey': token
      },
    });

    const data = await response.text();
    console.log(data);

    if(data === "Token is valid"){

    }
    else{
      this.setUser(null,null)
    }
   
  }

  render () {
    console.log(this.props.cookies.get('authorizationToken'));
    let token = this.props.cookies.get('authorizationToken')

    return (
        <Layout user={this.state.user} setUser={this.setUser} cookies={this.props.cookies}>
           {token !== undefined ? <Redirect to="/home"/> : <Route path='/login' render={(props) => <LoginContainer setUser={this.setUser}/>} />}
           <Route path='/home' render={(props) => <Home user={this.state.user}/>}/>
           {token === undefined ? <Redirect to="/login"/> : <Route path='/participants' render={(props) => <ParticipantsContainer user={this.state.user} cookies={this.props.cookies} checkValidToken={this.checkValidToken}/>} />}
         </Layout>
    );
  }
}

export default withCookies(App);
