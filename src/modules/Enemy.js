import * as UTIL from './Constants';

/*START ENEMY CLASS*/
let Enemy = function(xPos, yPos, XP, damage, health, level, consumedCallback) {
  //health, XP, level, damage
  this.type='enemy';
  this.visible=true;
  this.consumed=false;
  this.xPos=xPos;
  this.yPos=yPos;
  this.size=5;
  this.ctx=null;
  this.XP=XP;
  this.damage=damage;
  this.health=health;
  this.level=level;

  this.gainFromKill=Math.floor(XP/level);
  this.consumedCallback=consumedCallback;
}

Enemy.prototype.attack = function() {
  return this.damage*UTIL.randomIn(1,10);
}

Enemy.prototype.drawSelf = function(ctx) {
  if (this.consumed) { return false; }
  ctx.fillStyle='#FF0000';
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
}

Enemy.prototype.animate = function(ctx, callback) {
  let red='#F00';
  let orange='#A0E';
  ctx.fillStyle=red;
  let animCt=0;
  let interval=setInterval(()=>{
    if (animCt===7) {
      clearInterval(interval);
      ctx.clearRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
      if (this.heath>0) {
        ctx.fillStyle=orange;
        ctx.fillRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
      }
      else {
        ctx.clearRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
      }
      return callback();
    }
    animCt++;
    ctx.clearRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
    animCt%2!==0 ? ctx.fillStyle=orange : ctx.fillStyle=red;
    ctx.fillRect(this.xPos,this.yPos,UTIL.playerSize,UTIL.playerSize);
  },UTIL.ANIMATION_REPEAT_INTERVAL);
}

Enemy.prototype.consume = function(ctx, oldBackgroundColor) {
  if (this.consumedCallback) { this.consumedCallback(); }
  ctx.fillStyle=oldBackgroundColor;
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
  this.consumed=true;
}
/*END ENEMY CLASS*/

export default Enemy;
