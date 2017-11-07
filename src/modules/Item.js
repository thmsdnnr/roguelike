import * as UTIL from './Constants';

/*START ITEM CLASS*/
let Item = function(xPos, yPos, size, type, value, consumedCallback, visible) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.size=size;
  this.type=type;
  this.value=value;
  this.consumed=false;
  this.consumedCallback=consumedCallback;
  this.visible=visible;
}

Item.prototype.drawSelf = function(ctx) {
  if (this.consumed) { return false; }
  switch (this.type) {
    case 'health': ctx.fillStyle='#0F0'; break;
    case 'teleporter': ctx.fillStyle='#000'; break;
    case 'weapon': ctx.fillStyle='#FFA500'; break;
    case 'enemy': ctx.fillStyle='#FF0000'; break;
  }
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
}

Item.prototype.consume = function(ctx, oldBackgroundColor) {
  if (this.consumedCallback) { this.consumedCallback(); }
  else {
    ctx.fillStyle=oldBackgroundColor;
    ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
    this.consumed=true;
  }
}
/*END ITEM CLASS*/

export default Item;
