import React, { Component } from 'react';
import {Game, Player} from './BinaryTree.js';

export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state={showHint: true, redrawDistance:10, hide:true, keyHeld:null, steps:0, keyTimeout:null, ctx:null, P:null};
    this.movePlayer=this.movePlayer.bind(this);
    this.playerChange=this.playerChange.bind(this);
  }

  playerChange = (P) => {
    console.log(this.state.P,'playerchg');
    this.setState({P:P});
  }

  componentDidMount() {
    let P = new Player();
    P.callbackChange = this.playerChange;
    let G = new Game();
    G.initLevel(P);
    G.resetCallback=this.movePlayer;
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
    this.state.ctx.lineWidth = 5;
    this.state.ctx.strokeStyle = 'green';
    this.state.ctx.arc(camX, camY, 105, 0, Math.PI * 2, false);
    this.state.ctx.stroke();
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
      // if (e.code==='KeyP') {
      //   clearInterval(this.state.repeat);
      // }
      // if (e.code==='KeyG') {
      //   let repeat=setInterval(()=>{this.state.G.initLevel(this.state.P);},2000);
      //   this.setState({repeat});
      // }
      if (e.code==='KeyH') {
        this.setState({hide:!this.state.hide}, ()=>{
          this.state.G.toggleHide();
          this.draw();
        });
      }
      if (e.code==='KeyL') {
        this.state.G.logEntities();
      }
      let steps = e.ctrlKey ? 20 : 5;
      this.setState({steps:this.state.steps+=steps});
      if ((Math.abs(this.state.P.xPos-this.state.camX)>this.state.redrawDistance)||(Math.abs(this.state.P.yPos-this.state.camY)>25))
      {
        this.draw();
      }
      this.movePlayer(e.code, steps);
    }
  }

  render() {
    let W=null;
    let moveHint;
    const P=this.state.P;
    if (P) {
    if (P.weapon) {
      W=P.weapon.map((e,idx)=>{ return <li key={idx}>{e.name}, damage: {e.damage}</li> });
    }
    if (P.moveHint&&this.state.showHint) {
      if (P.moveHint.xDist<50&&P.moveHint.yDist<50) {
        //do nothing
      }
      else {
        let normX, normY, absX, absY;
        absX=Math.abs(P.moveHint.xDist);
        absY=Math.abs(P.moveHint.yDist);
        if (absX>absY) {
          normX=1;
          normY=absY/absX;
        }
        else if (absY>absX) {
          normY=1;
          normX=absX/absY;
        }
        else { //equal
          normX=1;
          normY=1;
        }
        let Q;
        if ((P.moveHint.xDist>0&&P.moveHint.yDist>0)) { Q=0; }
        else if ((P.moveHint.xDist<0&&P.moveHint.yDist>0)) { Q=1; }
        else if ((P.moveHint.xDist<0&&P.moveHint.yDist<0)) { Q=2; }
        else if ((P.moveHint.xDist>0&&P.moveHint.yDist<0)) { Q=3; }
        let degAngle=Math.atan(normY/normX)*(180/Math.PI)+(Q)*90;
        let arrows=['','→','↗','↑','↖','←','↙','↓','↘'];
        let radAngle=(degAngle*(Math.PI))/180;
        moveHint=arrows[Math.ceil(degAngle/45)];
        // moveHint = (<div style={{transform: `rotate(-${degAngle}deg)`, transformOrigin: 'center'}}>→</div>);
      }
    }
  }
    return(<div>
      <div id="info">Health: {this.state.P&&this.state.P.health || 0}<br />
      Weapons: {this.state.P&&this.state.P.weapon&&this.state.P.weapon.map(
        (e,idx)=>{ return <li key={idx}>{e.name}, damage: {e.damage}</li> }
      )||'none'}<br />
      XP: {this.state.P&&this.state.P.XP || ''}<br />
      movement hint: {moveHint && moveHint}
      </div>
      <div id="map">
    <canvas id="game" width="500" height="500" />
    </div>
  </div>);
  }
}
