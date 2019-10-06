import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './containers/Home'


class App extends React.Component {


  render(){
    return (
      <div>
        <header>
          <h1>MyLixo</h1>
        </header>
        <Home/>
      </div>
    );
  }
  
}

export default App;
