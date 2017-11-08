import * as UTIL from './Constants';
import Container from './Container';

let Leaf = function(x, y, width, height) {
  this.id=null;
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.left=null;
  this.right=null;
  this.container=null;
  this.visible=true;
  this.type='leaf'
}

Leaf.prototype.addContainer = function() {
  let width=UTIL.round5(UTIL.randomIn(0.7, 0.8)*this.width);
  let height=UTIL.round5(UTIL.randomIn(0.7, 0.8)*this.height);
  let xPos=UTIL.round5(this.x+(this.width-width)/2);
  let yPos=UTIL.round5(this.y+(this.height-height)/2);
  this.container=new Container(xPos, yPos, xPos+width, yPos+height);
}

Leaf.prototype.drawSelf = function(ctx) {
  let C=this.container;
  if (!C.fillStyle) {
    let grd=ctx.createLinearGradient(C.x1,C.y1,C.x2,C.y2);
    grd.addColorStop(0, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
    grd.addColorStop(0.5, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
    grd.addColorStop(1,'#480048');
    C.fillStyle=grd;
  }
  ctx.fillStyle=C.fillStyle;
  ctx.fillRect(C.x1, C.y1, C.x2-C.x1, C.y2-C.y1);
}

Leaf.prototype.splitLeaf = function() {
  if (this.left!==null||this.right!==null) { return false; }

  let splitVertical = UTIL.randomIn(0, 1)>=0.5;
  let max = (splitVertical ? this.width : this.height)-UTIL.minLeafSize;
  if (max <= UTIL.minLeafSize) { return false; }

  if (this.width>this.height && this.width/this.height>=1.25) { splitVertical=true; }
  else if (this.height>this.width && this.height/this.width >= 1.25) { splitVertical=false; }

  if (splitVertical) {
    let splitLoc=UTIL.randomIn(UTIL.minLeafSize,max);
    this.left=new Leaf(this.x, this.y, splitLoc, this.height);
    this.right=new Leaf(this.x+splitLoc, this.y, this.width-splitLoc, this.height);
  }
  else {
    let splitLoc=UTIL.randomIn(UTIL.minLeafSize,max);
    this.left=new Leaf(this.x, this.y, this.width, splitLoc);
    this.right=new Leaf(this.x, this.y+splitLoc, this.width, this.height-splitLoc);
  }
  return true;
}

Leaf.prototype.getLeafs = function() { return (!this.left&&!this.right) ? [this] : [].concat(this.left.getLeafs(), this.right.getLeafs()); }

export default Leaf;
