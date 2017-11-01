import React, { Component } from 'react';
import {InitLevel, Player} from './BinaryTree.js';

export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state={downKeys:[],ctx:null,P:null};
  }

  componentDidMount() {
    let P = new Player();
    InitLevel(P);
    this.setState({P});
    window.addEventListener('keypress', this.handleKeyPress);
    // window.addEventListener('keydown', this.handleKeyPress);
    // window.addEventListener('keyup', this.handleKeyPress);

    // setInterval(()=>{Test();},5000);
  }

  handleKeyPress = (e) => {
    console.log(e);
    // let speed=false;
    // if (e.type==='keyup') {
    //   speed=false;
    // }
    // if (e.type==='keydown') {
    //   speed=true;
    //   setInterval
    //   //set interval check for keyup
    // }
    // this.setState({meh:'meh'});
    console.log(this.state);
    if (this.state) {
      let step=5;
      if (e.ctrlKey) { step=20; }
      switch (e.code) {
        case 'KeyW': this.state.P.movePlayer(0,-step); break;
        case 'KeyA': this.state.P.movePlayer(-step,0); break;
        case 'KeyS': this.state.P.movePlayer(0,step); break;
        case 'KeyD': this.state.P.movePlayer(step,0); break;
      }
    }
  }

  render() {
    return(<div id="map"><canvas id="game" width="2000" height="2000" /></div>);
  }
}
