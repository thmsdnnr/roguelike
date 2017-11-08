import * as UTIL from './Constants';

let Item = function(xPos, yPos, size, type, value, consumedCallback, visible, msgCallback) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.size=size;
  this.type=type;
  this.value=value;
  this.consumed=false;
  this.consumedCallback=consumedCallback;
  this.visible=visible;
  this.displayMsg=msgCallback;
}

Item.prototype.drawSelf = function(ctx) {
  if (this.consumed) { return false; }
  switch (this.type) {
    case 'health': ctx.fillStyle='#0F0'; break;
    case 'teleporter':
    let grd=ctx.createLinearGradient(this.xPos,this.yPos,this.xPos+this.size,this.yPos+this.size);
    grd.addColorStop(0, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
    grd.addColorStop(0.5, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
    grd.addColorStop(1,'#480048');
    ctx.fillStyle=grd;
    break;
    case 'weapon': ctx.fillStyle='#FFA500'; break;
    case 'enemy': ctx.fillStyle='#FF0000'; break;
  }
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
}

Item.prototype.consume = function(ctx, oldBackgroundColor) {
  switch (this.type) {
    case 'health': this.displayMsg(`+${this.value} health`); break;
    case 'weapon': this.displayMsg(`picked up ${this.value.name}`); break;
    case 'teleporter': this.displayMsg(`a whole new worrrrrld...`); break;
  }
  if (this.consumedCallback) { this.consumedCallback(); }
  else {
    ctx.fillStyle=oldBackgroundColor;
    ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
    this.consumed=true;
  }
}

export default Item;
