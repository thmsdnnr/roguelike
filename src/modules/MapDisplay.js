import React, { Component } from 'react';
import {Game, Player} from './BinaryTree.js';

export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state={redrawDistance:10, hide:true, keyHeld:null, steps:0, keyTimeout:null, ctx:null, P:null};
    this.movePlayer=this.movePlayer.bind(this);
  }

  componentDidMount() {
    let P = new Player();
    let G = new Game();
    G.initLevel(P);
    let cvs = document.getElementById('game');
    let ctx = cvs.getContext('2d');
    this.setState({G,P,ctx,cvs});

    window.addEventListener('keypress', this.handleKeyPress);
    // window.addEventListener('keydown', this.handleKeyHeld);
    // window.addEventListener('keyup', this.handleKeyHeld);
    // // setInterval(()=>gameLoop(),33);
    // let repeat=setInterval(()=>{InitLevel(P);},2000);
    // this.setState({repeat});
  }

  movePlayer = (key, step) => {
    if (this.state.P) {
      if (!this.state.camX) {
        var camX = this.state.P.xPos;
        var camY = this.state.P.yPos;
        this.setState({camX:camX, camY:camY});
      }

      const C=this.state.ctx;
      switch (key) {
        case 'KeyW': this.state.P.movePlayer(0,-step,C); break;
        case 'KeyA': this.state.P.movePlayer(-step,0,C); break;
        case 'KeyS': this.state.P.movePlayer(0,step,C); break;
        case 'KeyD': this.state.P.movePlayer(step,0,C); break;
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

  clamp = (min, max) => Math.min(Math.max(this, min), max);

   draw = () => {
    this.state.ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
    this.state.ctx.clearRect(0, 0, this.state.cvs.width, this.state.cvs.height);//clear the viewport AFTER the matrix is reset
    //Clamp the camera position to the world bounds while centering the camera around the player
    var camX = this.state.P.xPos;
    var camY = this.state.P.yPos;
    this.setState({camX:camX, camY:camY});
    console.log(camX, camY);
if (this.state.hide)
  {
    this.state.ctx.fillStyle='#000';
    this.state.ctx.fillRect(0,0,this.state.cvs.width,this.state.cvs.height);
  }
    this.state.ctx.translate(this.state.cvs.width/2-camX,this.state.cvs.height/2-camY);
if (this.state.hide) {
    this.state.ctx.save();
    // Create a circle
    this.state.ctx.beginPath();
    this.state.ctx.arc(camX, camY, 100, 0, Math.PI * 2, false);
    this.state.ctx.clip();
  }
    this.state.G.drawEntities();
    this.state.P.drawSelf(this.state.ctx);
    if (this.state.hide) {
      this.state.ctx.restore();
    }
}

  handleKeyPress = (e) => {
    if (this.state) {
      if (e.code==='KeyP') {
        clearInterval(this.state.repeat);
      }
      if (e.code==='KeyG') {
        let repeat=setInterval(()=>{this.state.G.initLevel(this.state.P);},2000);
        this.setState({repeat});
      }
      if (e.code==='KeyH') {
        this.setState({hide:!this.state.hide}, ()=>this.draw());
      }
      let steps = e.ctrlKey ? 20 : 5;
      this.setState({steps:this.state.steps+=steps});
      console.log(this.state.redrawDistance);
      if ((Math.abs(this.state.P.xPos-this.state.camX)>this.state.redrawDistance)||
      (Math.abs(this.state.P.yPos-this.state.camY)>25))
      {
        this.draw();
      }
      // if (this.state.steps%10===0) {
      //   this.draw();
      //   this.setState({steps:0});
      // }
      this.movePlayer(e.code, steps);
    }
  }

  render() {
    return(<div id="map"><canvas id="game" width="500" height="500" /></div>);
  }
}
