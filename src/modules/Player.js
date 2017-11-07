import * as UTIL from './Constants';

/*START PLAYER CLASS*/
let Player = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
  this.health=50;
  this.XP=1;
  this.level=1;
  this.weapon={name:'fists', damage:5}
  this.alive=true;
}

Player.prototype.currentlyInside = function() {
  return this.currentLocation;
}

Player.prototype.animate = function(ctx, callback) {
  let red='#F00';
  let white='#FFF';
  ctx.fillStyle=red;
  let animCt=0;
  let interval=setInterval(()=>{
    if (animCt===6) {
      clearInterval(interval);
      ctx.clearRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
      ctx.fillStyle=white;
      ctx.fillRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
      return callback();
    }
    animCt++;
    ctx.clearRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
    animCt%2!==0 ? ctx.fillStyle=white : ctx.fillStyle=red;
    ctx.fillRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
  },UTIL.ANIMATION_REPEAT_INTERVAL);
}

Player.prototype.consume = function(e) {
  const type=e.type;
  switch (e.type) {
    case 'health': this.hasOwnProperty(type) ?  this[type]+=e.value : this[type]=e.value; break;
    case 'teleporter': break; //TODO weapon handling, eliminate duplicates
    case 'weapon': this.weapon=e.value; break; //this.hasOwnProperty(type) ? this[type]=this[type].concat(e.value) :
  }
  this.callbackChange(this);
}

Player.prototype.drawSelf = function(ctx) {
  ctx.fillStyle='#FFF';
  ctx.fillRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
}

Player.prototype.setPos = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
}

Player.prototype.attack = function() {
  return this.weapon.damage*this.XP;
}

Player.prototype.movementHint = function(ctx) {
  let C=this.currentLocation;
  if (C.type==='container'&&C.hallway) { //we are in a container or...
    this.moveHint=UTIL.compass({x1:this.xPos,y1:this.yPos},{x1:C.hallway.x1,y1:C.hallway.y1});
  }
  else if (C.type==='hallway'&&C.connectsNodes[1]) { //we are in a hallway
    C=C.connectsNodes[1];
    this.moveHint=UTIL.compass({x1:this.xPos,y1:this.yPos},{x1:C.x1,y1:C.y1});
  }
  else { //in the last container, movement hint is "DEFEAT THE BOSS"
    this.moveHint='defeat the boss to advance';
  }
}

Player.prototype.death = function() {
  this.alive=false;
  this.callbackChange(this);
}

Player.prototype.movePlayer = function(xAmt, yAmt, ctx) {
  let currentEl=this.currentlyInside();
  this.movementHint(ctx);
  let nextEl = this.currentLocation.isMoveAllowed(this.xPos+xAmt, this.yPos+yAmt);
  if (nextEl) {
    this.currentLocation=nextEl;
    let touching=currentEl.isTouchingItem(this.xPos+xAmt, this.yPos+yAmt);
    if (touching.type==='enemy') { //TODO more robust UTIL.fighting
      this.callbackToggleFreezeMovement();
      UTIL.fight(this,touching,ctx,currentEl,this.callbackToggleFreezeMovement,xAmt,yAmt);
      this.enemyInfo=touching;
      this.callbackChange(this);
      return false;
    }
    else if (touching&&!touching.consumed){
      this.consume(touching);
      touching.consume(ctx, currentEl.fillStyle);
    }
    ctx.fillStyle=currentEl.fillStyle;
    ctx.clearRect(this.xPos,this.yPos,5,5);
    ctx.fillRect(this.xPos,this.yPos,5,5);
    this.xPos+=xAmt;
    this.yPos+=yAmt;
    this.drawSelf(ctx);
  }
  else { console.log('cannot go to there'); }
}
/*END PLAYER CLASS*/

export default Player;
