//globals
  let camX=500;
  let camY=500;
let Player = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
}

let Item = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.type='health';
  this.value=10;
}

Item.prototype.drawSelf = function(ctx) {
  ctx.fillStyle='#0F0';
  console.log('draw');
  ctx.fillRect(this.xPos,this.yPos,5,5);
}

Item.prototype.consume = function(ctx) {
  // ctx.clearRect(this.xPos,this.yPos,5,5);
  this.consumed=true;
}

let Teleporter = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
}

Player.prototype.currentlyInside = function() {
  for (var i=0;i<this.entities.length;i++) { //TODO optimize
    const e=this.entities[i];
    if ((((e.x1<=this.xPos)&&(e.x2>=this.xPos+playerSize)))&&
    ((e.y1<=this.yPos)&&(e.y2>=this.yPos+playerSize))) {
      console.log(e);
      return e;
    }
  }
}

Player.prototype.consume = function(e) {
  const type=e.type;
  this.hasOwnProperty(type) ?  this[type]+=e.value : this[type]=e.value;
  }

Player.prototype.isTouching = function() {
  console.log(this.touchables);
  for (var i=0;i<this.touchables.length;i++) { //TODO optimize
    const e=this.touchables[i];
    if ((e.xPos===this.xPos)&&(e.yPos===this.yPos))
    {
      this.consume(e);
      e.consume();
      return e;
    }
    }
  }

//TODO special handling needed for hallways
Player.prototype.isMoveAllowed = function(newX, newY) {
  console.dir(this);
  for (var i=0;i<this.entities.length;i++) { //TODO optimize
    let e=this.entities[i];
    if ((((e.x1<=newX)&&(e.x2>=newX+playerSize)))&&
    ((e.y1<=newY)&&(e.y2>=newY+playerSize))) {
          return e;
    }
  }
  return false;
}

Player.prototype.drawSelf = function(ctx) {
  ctx.fillStyle='#FFF';
  ctx.fillRect(this.xPos,this.yPos,5,5);
}

Player.prototype.setPos = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
}

Player.prototype.movePlayer = function(xAmt, yAmt, ctx) {

  let e=this.isMoveAllowed(this.xPos+xAmt, this.yPos+yAmt);
  if (e) {
    const currentEl=this.currentlyInside();
    if (currentEl!==e) { console.log('we transitioned'); }
    ctx.fillStyle=currentEl.fillColor;
    ctx.strokeStyle=currentEl.fillColor;
    ctx.clearRect(this.xPos,this.yPos,5,5);
    ctx.fillRect(this.xPos,this.yPos,5,5);
    this.xPos+=xAmt;
    this.yPos+=yAmt;
    this.drawSelf(ctx);
    console.log(this.isTouching());

  }
  else {
    console.log('cannot go to there');
  }
}

const flattenArr = (arr) => [].concat(...arr);

const round5 = (x) => Math.ceil(x/5)*5;
const randomIn = (min,max) => Math.floor(Math.random()*(max-min))+min;
const rF = (min,max) => Math.floor(Math.random()*(max-min))+min;
const hallwayWidth = 10;
const minLeafSize=20;
const maxLeafSize=500;
const desiredNumberOfLeaves=25;
const playerSize = 5;
const gameWidth=1000;
const gameHeight=1000;

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

let Container = function(x1, y1, x2, y2) {
  this.x1=x1;
  this.y1=y1;
  this.x2=x2;
  this.y2=y2;
  this.hallway=null;
  this.fillColor=null;
  this.contents=[]; //contents is an array of entities
}

Leaf.prototype.addContainer = function() {
  let width=round5(randomIn(0.7, 1)*this.width);
  let height=round5(randomIn(0.7, 1)*this.height);
  let xPos=round5(this.x+(this.width-width)/2);
  let yPos=round5(this.y+(this.height-height)/2);
  this.container=new Container(xPos, yPos, xPos+width, yPos+height);
}

Leaf.prototype.drawSelf = function(ctx) {
  let C=this.container;
  var grd=ctx.createLinearGradient(C.x1,C.y1,C.x2,C.y2);
  grd.addColorStop(0,'#C04848');
  grd.addColorStop(0.25,'#ED4264');
  grd.addColorStop(0.75,'#FFEDBC');
  // grd.addColorStop(0.25,"pink");
  grd.addColorStop(1,'#480048');
  ctx.fillStyle=grd;
  // ctx.fillRect(20,20,150,100);

  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  C.fillColor=grd;//`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.fillStyle=C.fillColor;
  // ctx.strokeRect(this.x, this.y, this.width, this.height);
  ctx.fillRect(C.x1, C.y1, C.x2-C.x1, C.y2-C.y1);
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
  console.log('new hallway');
  this.x1=x1;
  this.y1=y1;
  this.x2=x2;
  this.y2=y2;
  this.direction=direction;
  this.connectsNodes=null;
  this.subHallway=null;
  this.fillColor=null;
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

Hallway.prototype.drawSelf = function(ctx) {
  let halls=this.getSubHallways();
  console.log(halls,'halsey');
  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.fillStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  halls.forEach((hall)=>{
    ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
    ctx.fillStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;

    hall.fillColor=ctx.fillStyle;
    // if (hall.direction==='V') {
      ctx.fillRect(hall.x1, hall.y1, hall.x2-hall.x1, hall.y2-hall.y1);
    // }
    // else {
    //   ctx.fillRect(hall.x1pos, hall.y1pos, hall.x2pos-hall.x1pos, hallwayWidth);
    // }
  });
}

const rangeOverlap = (a,b) => [Math.max(a[0],b[0]),Math.min(a[1],b[1])];

Container.prototype.randomPosToFit = function (size) {
  if (!this.contents.length) {
    let randX=round5(randomIn(this.x1,(this.x2-size)));
    let randY=round5(randomIn(this.y1,(this.y2-size)));
    return {
      x1:randX,
      y1:randY,
      x2:randX+size,
      y2:randY+size
    };
  }
  for (var m=0;m<10;m++) {
    let randX=round5(randomIn(this.x1,(this.x2-size)));
    let randY=round5(randomIn(this.y1,(this.y2-size)));
    let candidate={
      x1:randX,
      y1:randY,
      x2:randX+size,
      y2:randY+size
    };
    for (var i=0;i<this.contents.length;i++) {
      if (doesCollide(this.contents[i],candidate)) {
        break;
      }
      if (i===this.contents.length-1) { return candidate; }
    }
  }
  return false;
}

const doesCollide = (a,b) => {
  var rect1 = {x: a.x1, y: a.y1, width: a.x2-a.x1, height: a.y2-a.y1};
  var rect2 = {x: b.x1, y: b.y1, width: b.x2-b.x1, height: b.y2-b.y1};
if (rect1.x < rect2.x + rect2.width &&
   rect1.x + rect1.width > rect2.x &&
   rect1.y < rect2.y + rect2.height &&
   rect1.height + rect1.y > rect2.y) {
     return true;
}
  return false;
}

Container.prototype.calculateHallway = function(dest, containerList) {
  //TODO collision detection w/ containerList

  let widthRO=rangeOverlap([dest.x1,dest.x2],[this.x1, this.x2]);
  let heightRO=rangeOverlap([dest.y1, dest.y2],[this.y1, this.y2]);
  // console.log(widthRO, heightRO);
  if ((widthRO[1]-widthRO[0]>0)&&((widthRO[1]-widthRO[0])>hallwayWidth)) {
    let xCoord=round5(randomIn(widthRO[0]+hallwayWidth, widthRO[1]-hallwayWidth));
    let yCoord=round5(this.y2);
    let distance=dest.y1-this.y2;
    console.log(this.id, 'width overlap draw vertical line', widthRO);
    console.log('xcoord, ycoord, distance', xCoord, yCoord, distance);
    this.hallway=new Hallway(xCoord, yCoord, xCoord+hallwayWidth, yCoord+distance,'V');
    this.hallway.connectsNodes=[this.id, dest.id];
  }
  else if ((heightRO[1]-heightRO[0]>0)&&((heightRO[1]-heightRO[0])>hallwayWidth)) {
    console.log(this.id, 'height overlap draw horizontal line', heightRO);
    let yCoord=round5(randomIn(heightRO[0]+hallwayWidth, heightRO[1]-hallwayWidth));
    let xCoord=round5(this.x2);
    let distance=dest.x1-this.x2;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+distance, yCoord+hallwayWidth, 'H');
    this.hallway.connectsNodes=[this.id, dest.id];
  }
  else {
    console.log(this.id, 'need to draw both vert and horiz lines');
    let destFartherRight = (dest.x2-this.x2>0) ? true : false;
    let destFartherUp = (this.y2-dest.y1>0) ? true : false;
    let xDistance=Math.abs(dest.x1-this.x2);
    let yDistance=Math.abs(dest.y1-this.y2);
    xDistance = destFartherRight ? xDistance : -1*xDistance;
    yDistance = destFartherUp ? yDistance : -1*yDistance;

    let yStart = round5(randomIn(dest.y1+hallwayWidth,dest.y2-hallwayWidth));
    let yEnd = round5(randomIn(this.y1+hallwayWidth,this.y2-hallwayWidth));

    let xStart, xEnd;
    let h1, h2, h3;
    if (destFartherRight) {
      //farther right, start with right TODO or up
      //if destFartherRight, pick random y-coord to start from on this
      //go out half distance RIGHT
      xStart=this.x2;
      xEnd=dest.x1;

      let potentialRects=[];
      //possible hallways: anything between xStart and xEnd
      //random hallway value between xStart+1+hallwayWidth and xEnd-1-hallwayWidth
      //check for entity intersection at each width for height from yStart to yEnd
      for (var i=0;i+hallwayWidth+xStart<xEnd;i++) {
        potentialRects.push({
          x1:xStart+i,
          x2:xStart+i+hallwayWidth,
          y1:yStart,
          y2:yEnd
        });
      }
      console.log(potentialRects);
      let testedOptions=[];
      let good=true;
      for (var i=0;i<potentialRects.length;i++) {
        good=true;
        for (var j=0;j<containerList.length;j++) {
          if (doesCollide(potentialRects[i],containerList[j])) { good=false; break; }
        }
        if (good) { testedOptions.push(potentialRects[i]); good=false; }
      }

      let newY=testedOptions[Math.floor(testedOptions.length/2)];
      if (!newY) { return false; } //cannot construct a hallway
      if (destFartherUp) {
        h1=new Hallway(xStart, newY.y2, newY.x1, newY.y2+hallwayWidth, 'H-first');
        h2=new Hallway(h1.x2, newY.y1, newY.x2, newY.y2+hallwayWidth, 'V-middle');
        h1.subHallway=h2;
      }
      else { //TODO this doesnt seem to matter up or down we just draw it
        //go DOWN to random y-coord on destination
        // h2=new Hallway(h1.x2, h1.y2, xStart+hallwayWidth+xDistance/2, yEnd, 'V');
        // h1.subHallway=h2;
      }
      //go remaining half-distance LEFT
      h3 = new Hallway(h2.x2, yStart, xStart+xDistance, yStart+hallwayWidth, 'H-last');
      h2.subHallway=h3;
    }
    else { //farther left, start down TODO or up
      xStart = round5(randomIn(this.x1+hallwayWidth,this.x2-hallwayWidth));
      xEnd = round5(randomIn(dest.x1+hallwayWidth,dest.x2-hallwayWidth));
      yStart = this.y2;
      yEnd = dest.y1;

      let potentialRects=[]; //test different y-values
      for (var i=0;i+hallwayWidth+yStart<yEnd;i++) {
        potentialRects.push({
          x1:xStart,
          x2:xEnd,
          y1:yStart+i,
          y2:yStart+i+hallwayWidth
        });
      }
      let testedOptions=[];
      let good=true;
      for (var i=0;i<potentialRects.length;i++) {
        good=true;
        for (var j=0;j<containerList.length;j++) {
          if (doesCollide(potentialRects[i],containerList[j])) { good=false; break; }
        }
        if (good) { testedOptions.push(potentialRects[i]); good=false; }
      }

      let newX=testedOptions[Math.floor(testedOptions.length/2)];
      if (!newX) { return false; } //cannot construct a hallway
      if (destFartherUp) {
        //TODO I believe this case (dest farther left and farther up) is impossible due to the BST
      }
      else { //farther left and farther down
        h1=new Hallway(xStart, yStart, xStart+hallwayWidth, newX.y1, 'V-first');
        h2=new Hallway(newX.x2+hallwayWidth, newX.y1, h1.x2, newX.y2, 'H-middle');
        h1.subHallway=h2;
      }
        //go DOWN to random y-coord on destination
      //go remaining half-distance DOWN
      h3 = new Hallway(h2.x1, h2.y2, h2.x1+hallwayWidth, yEnd, 'V-last'); //DOWN
      h2.subHallway=h3;
    }
    this.hallway=h1;
    console.log('farther right / up?', destFartherRight, destFartherUp);
  }
}

Container.prototype.drawSelf = function(ctx) {
  console.log(this);
  this.contents.map(e=>e.drawSelf(ctx));
}

let Game = function() {

};

Game.prototype.drawEntities = function() {
  this.entities.map(e=>e.drawSelf(this.ctx));
  let contents=this.entities.map(e=>e.contents ? e.contents : null).filter(e=>e);
console.log(contents); //contents.map(e=>e.drawSelf());
  this.P.touchables=flattenArr(contents);
  flattenArr(contents).filter(s=>!s.consumed).map(s=>s.drawSelf(this.ctx));

}

Game.prototype.generateBoard = function() {
  /* CREATE LEAVES */
  let root = new Leaf(0,0,gameWidth,gameHeight);
  let leafLitter=[root];
  let didSplit=true;
  while (didSplit) {
    didSplit=false;
    leafLitter.forEach((leaf)=>{
      if (leaf.left===null&&leaf.right===null) {
        if (leaf.splitLeaf()&&leafLitter.length<desiredNumberOfLeaves) {
          leafLitter.push(leaf.left, leaf.right);
          didSplit=true;
        }
      }
    });
  }
  /* DRAW CONTAINERS INSIDE LEAVES */
  let leaves=root.getLeafs();
  leaves.forEach((leaf,idx)=>{
    leaf.id=idx;
    leaf.addContainer();
    leaf.drawSelf(this.ctx);
    leaf.container.id=idx;
  });
  /*DRAW HALLWAYS BETWEEN CONTAINERS */
  let containers=leaves.map(l=>l.container);
  for (var i=0;i<leaves.length-1;i++) {
    leaves[i].container.calculateHallway(leaves[i+1].container, containers);
  }

  /*POSITION PLAYER*/
  let startPos=containers[0].randomPosToFit(playerSize);
  this.P.setPos(round5(startPos.x1),round5(startPos.y1));

  let hallways=flattenArr(containers.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways()));

  for (var q=0;q<containers.length;q++) { //TODO random item placement in all containers
    for (var j=0;j<5;j++) {
      let rPosition=containers[q].randomPosToFit(5);
      let health=new Item(round5(rPosition.x1), round5(rPosition.y1));
      containers[q].contents.push(health);
    }
  }
  this.leaves=leaves;
  this.entities=containers.concat(hallways,leaves).filter(e=>e);
}

Game.prototype.initLevel = function(P) {
  this.cvs = document.getElementById('game');
  this.ctx = this.cvs.getContext('2d');
  this.P=P;
  this.generateBoard();
  this.ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
  this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);//clear the viewport AFTER the matrix is reset
  //Clamp the camera position to the world bounds while centering the camera around the player
  var camX = P.xPos;
  var camY = P.yPos;
  console.log(camX, camY);
  this.ctx.fillStyle='#000';
  this.ctx.fillRect(0,0,this.cvs.width,this.cvs.height);
  this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
  // Save the state, so we can undo the clipping
   this.ctx.save();
   // Create a circle
   this.ctx.beginPath();
   this.ctx.arc(camX, camY, 50, 0, Math.PI * 2, false);
   // Clip to the current path
   this.ctx.clip();
   //draw
  this.drawEntities();
  P.entities=this.entities;
  P.drawSelf(this.ctx);

  this.ctx.restore();

  // ctx.clearRect(0, 0, cvs.height, cvs.width);
}

module.exports = {Game, Player};
