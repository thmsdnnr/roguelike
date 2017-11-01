const round5 = (x) => Math.ceil(x/5)*5;
const randomIn = (min,max) => Math.floor(Math.random()*(max-min))+min;
const rF = (min,max) => Math.floor(Math.random()*(max-min))+min;
const hallwayWidth = 10;
const minLeafSize=80;
const maxLeafSize=200;
const playerSize = 5;

let Leaf = function(x, y, width, height) { //x, y is upper-left coord
  // console.log('new leaf x, y, width, height:', x, y, width, height);
  this.id=null;
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.left=null;
  this.right=null;
  this.container=null;
}

let Container = function(x, y, width, height) {
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.x1pos=x;
  this.y1pos=y;
  this.x2pos=x+width;
  this.y2pos=y+height;
  this.hallway=null;
  this.fillColor=null;
}

Leaf.prototype.addContainer = function() {
  let width=round5(randomIn(0.8, 1)*this.width);
  let height=round5(randomIn(0.8, 1)*this.height);
  let xPos=round5(this.x+(this.width-width)/2);
  let yPos=round5(this.y+(this.height-height)/2);
  this.container=new Container(xPos, yPos, width, height);
}

Leaf.prototype.drawContainer = function(ctx) {
  let C=this.container;
  ctx.font = "24px Courier";
  ctx.fillStyle="#000";
  ctx.fillText(`${C.id}`,C.x+10,C.y+30);
  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  C.fillColor=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.fillStyle=C.fillColor;
  // ctx.strokeRect(this.x, this.y, this.width, this.height);
  ctx.fillRect(C.x, C.y, C.width, C.height);
}

Leaf.prototype.drawLeaf = function(ctx) {
  console.count('drawleaf');
  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  // ctx.fillStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.strokeRect(this.x, this.y, this.width, this.height);
  // ctx.fillRect(this.x, this.y, this.width, this.height);
}

Leaf.prototype.splitLeaf = function() {
  if (this.left!==null||this.right!==null) {
    return false;
  }

  let splitVertical = randomIn(0, 1)>=0.5;
  let max = splitVertical ? this.width : this.height;
  max-=minLeafSize;
  if (max <= minLeafSize) { return false; }

  if (this.width>this.height && this.height/this.width >= 0.5) { splitVertical=true; }
  else if (this.height>this.width && this.width/this.height >= 0.5) { splitVertical=false; }

  if (splitVertical) { //vertical split
    let splitLoc=randomIn(minLeafSize,max);
    this.left=new Leaf(this.x, this.y, splitLoc, this.height);
    this.right=new Leaf(this.x+splitLoc, this.y, this.width-splitLoc, this.height);
  }
  else {
    let splitLoc=randomIn(minLeafSize,max);
    this.left=new Leaf(this.x, this.y, this.width, splitLoc);
    this.right=new Leaf(this.x, this.y+splitLoc, this.width, this.height-splitLoc);
  }
  return true;
}

Leaf.prototype.getLeafs = function() {
  if (!this.left&&!this.right) { return [this]; }
  else {
    return [].concat(this.left.getLeafs(), this.right.getLeafs());
  }
}

let Hallway = function(x1, y1, x2, y2, direction) {
  this.x1=round5(x1);
  this.y1=round5(y1);
  this.x2=round5(x2);
  this.y2=round5(y2);
  this.direction=direction;
  this.connectsNodes=null;
  this.subHallway=null;
  this.fillColor=null;
  if (direction==='V') {
    this.x1pos=round5(x1);
    this.y1pos=round5(y1);
    this.x2pos=round5(x1)+hallwayWidth;
    this.y2pos=round5(y2);
  }
  else {
    this.x1pos=round5(x1);
    this.y1pos=round5(y1);
    this.x2pos=round5(x2);
    this.y2pos=round5(y1)+hallwayWidth;
  }
}

Hallway.prototype.getSubHallways = function() {
  if (!this.subHallway) { return [this] }
  else {
    let cHall=this.subHallway;
    let hList=[this];
    while (cHall!==null) {
      hList.push(cHall);
      cHall.subHallway ? cHall=cHall.subHallway : cHall=null;
    }
    return hList;
  }
}

Hallway.prototype.drawHallway = function(ctx) {
  let halls=this.getSubHallways();
  console.log(halls,'halsey');
  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.fillStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  halls.forEach((hall)=>{
    if (hall.direction==='V') {
      hall.fillColor=ctx.fillStyle;
      ctx.fillRect(hall.x1, hall.y1, hallwayWidth, hall.y2-hall.y1);
    }
    else {
      hall.fillColor=ctx.fillStyle;
      ctx.fillRect(hall.x1, hall.y1, hall.x2-hall.x1, hallwayWidth);
    }
  });
}

const rangeOverlap = (a,b) => [Math.max(a[0],b[0]),Math.min(a[1],b[1])];

Container.prototype.randomXY = function () {
  return [randomIn(this.x,this.x+this.width),randomIn(this.y,this.y+this.height)];
}

Container.prototype.calculateHallway = function(dest, containerList) {
  //TODO collision detection w/ containerList

  let widthRO=rangeOverlap([dest.x,dest.x+dest.width],[this.x, this.x+this.width]);
  let heightRO=rangeOverlap([dest.y,dest.y+dest.height],[this.y, this.y+this.height]);
  if (widthRO[1]-widthRO[0]>0) {
    console.log(this.id, 'width overlap draw vertical line', widthRO);
    let xCoord=(randomIn(widthRO[0]+hallwayWidth, widthRO[1]-hallwayWidth));
    let yCoord=this.y+this.height;
    let distance=dest.y-yCoord;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+distance, yCoord+distance, 'V');
    this.hallway.connectsNodes=[this.id, dest.id];
  }
  else if (heightRO[1]-heightRO[0]>0) {
    console.log(this.id, 'height overlap draw horizontal line', heightRO);
    let yCoord=randomIn(heightRO[0]+hallwayWidth, heightRO[1]-hallwayWidth);
    let xCoord=this.x+this.width;
    let distance=dest.x-xCoord;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+distance, yCoord+distance, 'H');
    this.hallway.connectsNodes=[this.id, dest.id];
  }
  else {
    console.log(this.id, 'need to draw both vert and horiz lines');
    let destFartherRight = (dest.x-(this.x+this.width)>0) ? true : false;
    let destFartherUp = ((this.y+this.height)-dest.y>0) ? true : false;
    let xDistance=(dest.x-(this.x+this.width));
    let yDistance=(this.y+this.height)-dest.y;
    xDistance = destFartherRight ? xDistance : -1*xDistance;
    yDistance = destFartherUp ? yDistance : -1*yDistance;

    let yStart = randomIn(this.y+hallwayWidth,this.y+this.height-hallwayWidth);
    let yEnd = randomIn(dest.y+hallwayWidth,dest.y+dest.height-hallwayWidth);

    let xStart, xEnd;
    let h1, h2, h3;
    if (destFartherRight) {
      //farther right, start with right TODO or up
      //if destFartherRight, pick random y-coord to start from on this
      //go out half distance RIGHT
      xStart=this.x+this.width;
      xEnd=dest.x;
      h1=new Hallway(xStart, yStart, xStart+xDistance/2, yStart, 'H');
      if (destFartherUp) {
        //if destFartherUp
        //go UP to random y-coord on destination
        h2=new Hallway(h1.x2, h1.y1+hallwayWidth, xStart+xDistance/2, yEnd, 'V');
        h1.subHallway=h2;
      }
      else {
        //go DOWN to random y-coord on destination
        h2=new Hallway(h1.x2, h1.y1, xStart+xDistance/2, yEnd, 'V');
        h1.subHallway=h2;
      }
      //go remaining half-distance RIGHT
      h3 = new Hallway(h2.x2, h2.y2, xStart+xDistance, h2.y2, 'H');
      h2.subHallway=h3;
    }
    else { //farther left, start down TODO or up
      xStart = randomIn(this.x+hallwayWidth,this.x+this.width-hallwayWidth);
      xEnd = randomIn(dest.x+hallwayWidth,dest.x+dest.width-hallwayWidth);
      yStart = this.y+this.height;
      yEnd = dest.y;
      //if !destFartherRight, pick random x-coord to start from on this
      //go out half distance DOWN

      h1=new Hallway(xStart, yStart, xStart, yStart+yDistance/2, 'V'); //DOWN
      if (destFartherUp) {
        //TODO I believe this case (dest farther right and farther up) is impossible due to the BST
      }
      else { //go LEFT
        h2=new Hallway(h1.x2, h1.y2, xEnd, h1.y2, 'H'); //LEFT
        h1.subHallway=h2;
        //go DOWN to random y-coord on destination
      }
      //go remaining half-distance DOWN
      h3 = new Hallway(h2.x2, h2.y2, h2.x2, yEnd, 'V'); //DOWN
      h2.subHallway=h3;
    }
    this.hallway=h1;
    console.log(xDistance, yDistance);
    console.log('farther right / up?', destFartherRight, destFartherUp);
  }
}

let Player = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
}

Player.prototype.currentlyInside = function() {
  for (var i=0;i<this.entities.length;i++) { //TODO optimize
    const e=this.entities[i];
    // console.log(e);
    if ((((e.x1pos<this.xPos+playerSize)&&(e.x2pos>=this.xPos+playerSize)))&&
    ((e.y1pos<this.yPos+playerSize)&&(e.y2pos>=this.yPos+playerSize))) {
          console.log('inside of:', e);
          return e;
        }
  }
  return false;
}

//TODO special handling needed for hallways
Player.prototype.isInsideEntity = function(newX, newY) {
  for (var i=0;i<this.entities.length;i++) { //TODO optimize
    let e=this.entities[i];
    // console.log(e);
    if ((((e.x1pos<newX+playerSize)&&(e.x2pos>=newX+playerSize)))&&
    ((e.y1pos<newY+playerSize)&&(e.y2pos>=newY+playerSize))) {
          console.log('inside of:', e);
          return e;
        }
  }
  return false;
  // console.log(this.entities[i]);
  // playerSize
}

Player.prototype.drawPlayer = function() {
  this.ctx.fillStyle='#FFF';
  let c=this.ctx.getImageData(this.xPos,this.yPos,1,1).data;
  console.log(this.xPos,this.yPos,c);
  let cRGBA=`rgba(${c[0]},${c[1]},${c[2]},1)`;
  this.lastRGBA=cRGBA;
  console.log(this.lastRGBA);
  this.ctx.fillRect(this.xPos,this.yPos,5,5);
}

Player.prototype.setPos = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
}

Player.prototype.movePlayer = function(xAmt, yAmt) {
  console.log('moveplayer');
  let e=this.isInsideEntity(this.xPos+xAmt, this.yPos+yAmt);
  if (e) {
    const currentEl=this.currentlyInside();
    console.log(currentEl);
    this.ctx.fillStyle=currentEl.fillColor;
    this.ctx.strokeStyle=currentEl.fillColor;
    this.ctx.clearRect(this.xPos,this.yPos,5,5);
    this.ctx.fillRect(this.xPos,this.yPos,5,5);
    this.xPos+=xAmt;
    this.yPos+=yAmt;
    this.drawPlayer();
  }
  else {
    console.log('outside');
  }
}

function InitLevel(P) {
  let cvs = document.getElementById('game');
  let ctx = cvs.getContext('2d');
  // ctx.scale(2,2);
  ctx.clearRect(0, 0, cvs.height, cvs.width);
  // ctx.fillStyle='#FFF';
  // ctx.fillRect(0, 0, cvs.height, cvs.width);
  // ctx.globalCompositeOperation = 'xor';
  ctx.fillStyle='#FFF';
  ctx.strokeStyle='#000';
  /* CREATE LEAVES */
  let root = new Leaf(0,0,700,700);
  root.splitLeaf();
  root.left.splitLeaf();
  root.left.left && root.left.left.splitLeaf();
  root.left.right && root.left.right.splitLeaf();
  root.left.left && root.left.left.left && root.left.left.left.splitLeaf();
  root.left.right && root.left.right.right && root.left.right.right.splitLeaf();

  root.right.splitLeaf();
  root.right.left && root.right.left.splitLeaf();
  root.right.right && root.right.right.splitLeaf();
  root.right.left && root.right.left.left && root.right.left.left.splitLeaf();
  root.right.right && root.right.right.right && root.right.right.right.splitLeaf();

  /* DRAW CONTAINERS INSIDE LEAVES */
  let leaves=root.getLeafs();
  leaves.map((l,idx)=>{
    l.id=idx;
    l.addContainer();
    l.container.id=idx;
    l.drawContainer(ctx);
  });

  /*DRAW HALLWAYS BETWEEN CONTAINERS */
  let containers=leaves.map(l=>l.container);
  for (var i=0;i<leaves.length;i++) {
    if (i===leaves.length-1) { //build hallway from last leaf to leaf 0 for a loop
      // leaves[i].container.calculateHallway(leaves[0].container)
    }
    else { leaves[i].container.calculateHallway(leaves[i+1].container, containers); }
  }

  /*POSITION PLAYER*/
  let startPos=containers[0].randomXY();
  console.log(startPos);
  P.setPos(round5(startPos[0]),round5(startPos[1]));
  P.ctx=ctx;
  console.log(P);
  P.drawPlayer();
  // setInterval(function(){P.movePlayer(5,0);},1000);
  let hallways=containers.map(c=>c.hallway);
  hallways.filter(e=>e).map(h=>h.drawHallway(ctx));
  let entities=containers.concat(hallways).filter(e=>e);
  P.entities=entities;
  console.log('entities',P.entities);
}

module.exports = {InitLevel, Player};
