import React, { Component } from 'react';
import Game from './Game.js';
import Player from './Player.js';

export default class Client extends Component {
  constructor(props) {
    super(props);
    this.state={movementAllowed: true, showHint: true, redrawDistance:10, hide:true, keyHeld:null, steps:0, keyTimeout:null, ctx:null, P:null};
    this.movePlayer=this.movePlayer.bind(this);
    this.gameChange=this.gameChange.bind(this);
    this.playerChange=this.playerChange.bind(this);
    this.noMove=this.noMove.bind(this);
    this.init=this.init.bind(this);
    this.messenger=this.messenger.bind(this);
    this.calculateAngle=this.calculateAngle.bind(this);
    this.loop=this.loop.bind(this);
  }

  messenger = (M) => {
    this.setState({gameMsg:M,msgReceivedTime:Date.now()});
  }

  draw = () => this.state.G.redraw();

  playerChange = (P) => {
    this.setState({P:Object.assign(this.state.P,P)},()=>{
      if (this.state.P.alive===false) {
        let C=this.state.ctx;
        let V=this.state.cvs;
        C.fillStyle='#000';
        C.fillRect(0,0,V.width,V.height);
        C.setTransform(1,0,0,1,0,0);
        C.clearRect(0,0,V.width,V.height);
        C.fillRect(0,0,V.width,V.height);
        C.fillStyle='#FFF';
        C.font = "28px Arial";
        let l1W=C.measureText("Sorry, but you died").width;
        let l2W=C.measureText(":()").width;
        let l3W=C.measureText("Please do try again!").width;
        C.fillText("Sorry, but you died",(V.width-l1W)/2,V.height/2-34);
        C.fillText(":(",(V.width-l2W)/2,V.height/2);
        C.fillText("Please do try again!",(V.width-l3W)/2,V.height/2+34);
        setTimeout(()=>{ this.init(); }, 3000);
      }
    });
  }

  gameChange = (G) => {
    this.setState({G:Object.assign(this.state.G,G)},()=>{
      if (this.state.G.playerWon) {
        let C=this.state.ctx;
        let V=this.state.cvs;
        C.fillStyle='#000';
        C.fillRect(0,0,V.width,V.height);
        C.setTransform(1,0,0,1,0,0);
        C.clearRect(0,0,V.width,V.height);
        C.fillRect(0,0,V.width,V.height);
        C.fillStyle='#FFF';
        C.font = "30px Courier";
        let counter=0;
        let interval=setInterval(function(){
          counter++;
          if (counter===200) { clearInterval(interval); }
          C.fillStyle=`rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1.0)`;
          C.fillText("WINNER",Math.random()*(V.width),Math.random()*(V.height));
        },20);
      setTimeout(()=>{ this.init(); },10000);
    }
  });
}

  loop() {
    this.draw;
    this.P.drawSelf(this.ctx);
  }

  init() {
    this.messenger('WASD-move, hold Ctrl-run, H: toggle view');
    let P = new Player();
    let G = new Game();
    //pass callbacks
    P.displayMsg=this.messenger;
    P.callbackChange = this.playerChange;
    P.callbackToggleFreezeMovement = this.noMove;
    G.displayMsg=this.messenger;
    G.resetCallback=this.movePlayer;
    G.callbackChange=this.gameChange;
    //start game
    G.initLevel(P);
    let cvs = document.getElementById('game');
    let ctx = cvs.getContext('2d');
    this.setState({G,P,ctx,cvs,movementAllowed:true});
    window.addEventListener('keypress', this.handleKeyPress);

    if (this.state.looping===false) {
      this.setState({looping:true},()=>requestAnimationFrame(this.loop)); // start the first frame
    }
  }

  componentDidMount() {
    this.init();
    window.addEventListener('keypress', this.handleKeyPress);
  }

  noMove = () => {
    this.setState({movementAllowed:!this.state.movementAllowed});
    this.draw();
  }

  movePlayer = (key, step) => {
    if (!this.state.movementAllowed) { return false; }
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
        default: break;
      }
    }
  }

  handleKeyHeld = (e) => {
    if (e.type==='keyup') {
      if (this.state.keyInterval) {
        clearInterval(this.state.keyInterval);
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
      if (e.code==='KeyH') {
        this.setState({hide:!this.state.hide}, ()=>{
          this.state.G.toggleHide();
          this.draw();
        });
      }
      let steps = e.ctrlKey ? 20 : 5;
      if ((Math.abs(this.state.P.xPos-this.state.camX)>this.state.redrawDistance)||(Math.abs(this.state.P.yPos-this.state.camY)>25))
      {
        this.draw();
      }
      this.movePlayer(e.code, steps);
    }
  }

  calculateAngle = () => {
    const P=this.state.P;
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
    else {
      normX=1;
      normY=1;
    }
    let Q;
    if ((P.moveHint.xDist>0&&P.moveHint.yDist>0)) { Q=0; }
    else if ((P.moveHint.xDist<0&&P.moveHint.yDist>0)) { Q=1; }
    else if ((P.moveHint.xDist<0&&P.moveHint.yDist<0)) { Q=2; }
    else if ((P.moveHint.xDist>0&&P.moveHint.yDist<0)) { Q=3; }
    return Math.atan(normY/normX)*(180/Math.PI)+(Q)*90;
  }

  render() {
    let W=null;
    let moveHint,enemyInfo,level;
    const P=this.state.P;
    const G=this.state.G;
    if (G) {
      if (G.level) {
        level=`Level ${G.level} of ${G.lastLevel}`;
      }
    }
    if (P) {
      if (P.weapon) { W=`${P.weapon.name} [damage: ${P.weapon.damage}]`; }
      if (P.moveHint) {
        // if (P.moveHint.xDist+P.moveHint.yDist<10) { //do nothing
        // } else {
        let degAngle=this.calculateAngle();
        moveHint = (<div id="moveArrow" style={{transform: `rotate(-${degAngle}deg)`}}>→</div>);
        }
    }
    let gameMsg=(<div id="gameMessage">{this.state.gameMsg}</div>);
    return(<div id="gameContainer">
          <div id="canvas">
            <canvas id="game" width="500" height="500" />
            {this.state.hide && moveHint}
          <div id="info">
            {level}<br />
            Health: {this.state.P&&this.state.P.health || 0} | XP: {this.state.P&&this.state.P.XP || ''} | Level: {this.state.P&&this.state.P.level || ''}<br />
            Weapon: {W}<br />
            {(Date.now()-this.state.msgReceivedTime<2000) && gameMsg}
          </div>
        </div>
      </div>);
  }
}
