import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './containers/Home'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Hints from './containers/Hints'

class App extends React.Component {


  render() {
    return (
      <Router>
        <div>
          <div className="home-screen">

            <header>
              <h1 className="app-title">MyLixo</h1>
            </header>

            <Switch>
              <Route path="/hints">
                <Hints />
              </Route>

              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }

}

export default App;
