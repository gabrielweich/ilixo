import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Home from './containers/Home';
import Hints from './containers/Hints';
import MapView from './containers/MapView';

class App extends React.Component {


  render() {
    return (
      <Router>
        <div>
          <div className="home-screen">

            {/* <header>
              <h1 className="app-title">MyLixo</h1>
            </header> */}

            <Switch>
              <Route exact path="/">
                <Home />
              </Route>

              <Route path="/hints">
                <Hints />
              </Route>

              <Route path="/map">
                <MapView />
              </Route>

            </Switch>
          </div>
        </div>
      </Router>
    );
  }

}

export default App;
