import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Client from './modules/Client.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Client />
      </div>
    );
  }
}

export default App;
