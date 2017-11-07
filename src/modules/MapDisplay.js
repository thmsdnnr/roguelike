import React, { Component } from 'react';
import Game from './BinaryTree.js';
import Player from './Player.js';

export default class MapDisplay extends Component {
  constructor(props) {
    super(props);
    this.state={movementAllowed: true, showHint: true, redrawDistance:10, hide:true, keyHeld:null, steps:0, keyTimeout:null, ctx:null, P:null};
    this.movePlayer=this.movePlayer.bind(this);
    this.gameChange=this.gameChange.bind(this);
    this.playerChange=this.playerChange.bind(this);
    this.noMove=this.noMove.bind(this);
    this.init=this.init.bind(this);
  }

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
        C.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
        C.clearRect(0,0,V.width,V.height);
        C.fillRect(0,0,V.width,V.height);
        C.fillStyle='#FFF';
        C.font = "30px Courier";
        let counter=0;
        let interval=setInterval(function(){
          counter++;
          if (counter==200) { clearInterval(interval); }
          C.fillStyle=`rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1.0)`;
          C.fillText("WINNER",Math.random()*(V.width),Math.random()*(V.height)); //(Math.random()+15)*counter,(Math.random()+15)*counter);
        },20);
      setTimeout(()=>{ this.init(); },10000);
    }
  });
}

  init() {
    let P = new Player();
    P.callbackChange = this.playerChange;
    P.callbackToggleFreezeMovement = this.noMove;
    let G = new Game();
    G.initLevel(P);
    G.resetCallback=this.movePlayer;
    G.callbackChange = this.gameChange;
    let cvs = document.getElementById('game');
    let ctx = cvs.getContext('2d');
    this.setState({G,P,ctx,cvs});
    // window.addEventListener('keypress', this.handleKeyPress);
  }

  componentDidMount() {
    this.init();
    window.addEventListener('keypress', this.handleKeyPress);
  }

  noMove = () => {
    this.setState({movementAllowed:!this.state.movementAllowed});
    this.draw(); //trigger a redraw TODO make only visible space
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

   draw = () => {
    this.state.ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
    this.state.ctx.clearRect(0, 0, this.state.cvs.width, this.state.cvs.height);//clear the viewport AFTER the matrix is reset
    //Clamp the camera position to the world bounds while centering the camera around the player
    var camX = this.state.P.xPos;
    var camY = this.state.P.yPos;
    this.setState({camX:camX, camY:camY});
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
    this.state.ctx.arc(camX, camY, 100, 0, Math.PI * 2, false);
    this.state.ctx.stroke();
    this.state.ctx.beginPath();
    this.state.ctx.arc(camX, camY, 95, 0, Math.PI * 2, false);
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
      if (e.code==='KeyH') {
        this.setState({hide:!this.state.hide}, ()=>{
          this.state.G.toggleHide();
          this.draw();
        });
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
    let moveHint,enemyInfo,level;
    const P=this.state.P;
    const G=this.state.G;
    if (G) {
      if (G.level) {
        level=`Level ${G.level} of ${G.lastLevel}`;
      }
    }
    if (P) {
    if (P.enemyInfo) {
      enemyInfo = P.enemyInfo.msg ? P.enemyInfo.msg : `health: ${P.enemyInfo.health}, XP: ${P.enemyInfo.XP}`;
    }
    if (P.weapon) {
      W=`${P.weapon.name} [damage: ${P.weapon.damage}]`;
    }
    if (P.moveHint&&this.state.showHint) {
      if (P.moveHint.xDist<30&&P.moveHint.yDist<30) {
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
      <div id="info">{level}<br />
      Health: {this.state.P&&this.state.P.health || 0} | XP: {this.state.P&&this.state.P.XP || ''}<br />
      Weapon: {W}<br />
      movement hint: {moveHint && moveHint}<br />
      enemy info {enemyInfo}
      </div>
      <div id="map">
    <canvas id="game" width="500" height="500" />
    </div>
  </div>);
  }
}
