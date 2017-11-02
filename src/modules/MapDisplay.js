import React, { Component } from 'react';
import {InitLevel, Player} from './BinaryTree.js';

export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state={keyHeld:null, keyTimeout:null, ctx:null, P:null};
    this.movePlayer=this.movePlayer.bind(this);
  }

  componentDidMount() {
    let P = new Player();
    InitLevel(P);
    this.setState({P});
    window.addEventListener('keypress', this.handleKeyPress);
    // window.addEventListener('keydown', this.handleKeyHeld);
    // window.addEventListener('keyup', this.handleKeyHeld);
    // // setInterval(()=>gameLoop(),33);
    let repeat=setInterval(()=>{InitLevel(P);},2000);
    this.setState({repeat});
  }

  movePlayer = (key, step) => {
    if (this.state.P) {
      switch (key) {
        case 'KeyW': this.state.P.movePlayer(0,-step); break;
        case 'KeyA': this.state.P.movePlayer(-step,0); break;
        case 'KeyS': this.state.P.movePlayer(0,step); break;
        case 'KeyD': this.state.P.movePlayer(step,0); break;
      }
    }
  }

  handleKeyHeld = (e) => {
    if (e.type==='keyup') {
      if (this.state.keyInterval) {
        clearInterval(this.state.keyInterval);
        console.log('cleared');
      }
    }
    if (e.type==='keydown') {
      if (this.state.keyInterval) {
        clearInterval(this.state.keyInterval);
      }
      let interval=setInterval(()=>{
        this.movePlayer(e.code,5);
      },10);
      this.setState({keyHeld:e.code, keyInterval:interval});
    }
  }

  handleKeyPress = (e) => {
    if (this.state) {
      if (e.code==='KeyP') {
        clearInterval(this.state.repeat);
      }
      if (e.code==='KeyG') {
        let repeat=setInterval(()=>{InitLevel(this.state.P);},2000);
        this.setState({repeat});
      }
      let step = e.ctrlKey ? 20 : 5;
      this.movePlayer(e.code, step);
    }
  }

  render() {
    return(<div id="map"><canvas id="game" width="2000" height="2000" /></div>);
  }
}
