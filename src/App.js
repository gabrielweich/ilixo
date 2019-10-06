import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './containers/Home'


class App extends React.Component {


  render() {
    return (
      <div>
        <div className="home-screen">
          <div className="home-container">
            <header>
              <h1 className="app-title">MyLixo</h1>
            </header>

            <Home />
          </div>
        </div>
      </div>
    );
  }

}

export default App;
