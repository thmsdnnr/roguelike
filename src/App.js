import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MapDisplay from './modules/MapDisplay.js';

class App extends Component {
  render() {
    let map=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    return (
      <div className="App">
        <MapDisplay map={map}/>
      </div>
    );
  }
}

export default App;
