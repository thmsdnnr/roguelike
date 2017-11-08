import * as UTIL from './Constants';

let Enemy = function(xPos, yPos, size, XP, damage, health, level, consumedCallback) {
  this.type='enemy';
  this.visible=true;
  this.consumed=false;
  this.xPos=xPos;
  this.yPos=yPos;
  this.size=size;
  this.ctx=null;
  this.XP=XP;
  this.damage=damage;
  this.health=health;
  this.level=level;
  this.gainFromKill=XP;
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
      ctx.clearRect(this.xPos,this.yPos,this.size,this.size);
      if (this.heath>0) {
        ctx.fillStyle=orange;
        ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
      }
      else {
        ctx.clearRect(this.xPos,this.yPos,this.size,this.size);
      }
      return callback();
    }
    animCt++;
    ctx.clearRect(this.xPos,this.yPos,this.size,this.size);
    animCt%2!==0 ? ctx.fillStyle=orange : ctx.fillStyle=red;
    ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
  },UTIL.ANIMATION_REPEAT_INTERVAL);
}

Enemy.prototype.consume = function(ctx, oldBackgroundColor) {
  if (this.consumedCallback) { this.consumedCallback({xPos:this.xPos,yPos:this.yPos}); }
  ctx.fillStyle=oldBackgroundColor;
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
  this.consumed=true;
  this.visible=false;
}

export default Enemy;
