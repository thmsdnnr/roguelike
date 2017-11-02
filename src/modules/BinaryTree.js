let Player = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
}

let Item = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.type='health';
}

Item.prototype.drawSelf = function(ctx) {
  ctx.fillStyle='#0F0';
  console.log('draw');
  ctx.fillRect(this.xPos,this.yPos,5,5);
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
      return e;
    }
  }
}

//TODO special handling needed for hallways
Player.prototype.isMoveAllowed = function(newX, newY) {
  console.log(this.entities);
  for (var i=0;i<this.entities.length;i++) { //TODO optimize
    let e=this.entities[i];
    if ((((e.x1<=newX)&&(e.x2>=newX+playerSize)))&&
    ((e.y1<=newY)&&(e.y2>=newY+playerSize))) {
          return e;
    }
  }
  return false;
}

Player.prototype.drawPlayer = function() {
  this.ctx.fillStyle='#FFF';
  this.ctx.fillRect(this.xPos,this.yPos,5,5);
}

Player.prototype.setPos = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
}

Player.prototype.movePlayer = function(xAmt, yAmt) {
  console.log('moveplayer');
  let e=this.isMoveAllowed(this.xPos+xAmt, this.yPos+yAmt);
  if (e) {
    const currentEl=this.currentlyInside();
    if (currentEl!==e) { console.log('we transitioned'); }
    this.ctx.fillStyle=currentEl.fillColor;
    this.ctx.strokeStyle=currentEl.fillColor;
    this.ctx.clearRect(this.xPos,this.yPos,5,5);
    this.ctx.fillRect(this.xPos,this.yPos,5,5);
    this.xPos+=xAmt;
    this.yPos+=yAmt;
    this.drawPlayer();
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
  let width=round5(randomIn(0.8, 1)*this.width);
  let height=round5(randomIn(0.8, 1)*this.height);
  let xPos=round5(this.x+(this.width-width)/2);
  let yPos=round5(this.y+(this.height-height)/2);
  this.container=new Container(xPos, yPos, xPos+width, yPos+height);
}

Leaf.prototype.drawContainer = function(ctx) {
  let C=this.container;
  var grd=ctx.createLinearGradient(C.x1,C.y1,C.x2,C.y2);
  grd.addColorStop(0,'#C04848');
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
  console.log('new hallway');
  this.x1=round5(x1);
  this.y1=round5(y1);
  this.x2=round5(x2);
  this.y2=round5(y2);
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

Hallway.prototype.drawHallway = function(ctx) {
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
    let randX=randomIn(this.x1,(this.x2-size));
    let randY=randomIn(this.y1,(this.y2-size));
    return {
      x1:randX,
      y1:randY,
      x2:randX+size,
      y2:randY+size
    };
  }
  for (var m=0;m<10;m++) {
    let randX=randomIn(this.x1,(this.x2-size));
    let randY=randomIn(this.y1,(this.y2-size));
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
    let xCoord=randomIn(widthRO[0]+hallwayWidth, widthRO[1]-hallwayWidth);
    let yCoord=this.y2;
    let distance=dest.y1-this.y2;
    console.log(this.id, 'width overlap draw vertical line', widthRO);
    console.log('xcoord, ycoord, distance', xCoord, yCoord, distance);
    this.hallway=new Hallway(xCoord, yCoord, xCoord+hallwayWidth, yCoord+distance,'V');
    this.hallway.connectsNodes=[this.id, dest.id];
  }
  else if ((heightRO[1]-heightRO[0]>0)&&((heightRO[1]-heightRO[0])>hallwayWidth)) {
    console.log(this.id, 'height overlap draw horizontal line', heightRO);
    let yCoord=randomIn(heightRO[0]+hallwayWidth, heightRO[1]-hallwayWidth);
    let xCoord=this.x2;
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

    let yStart = randomIn(dest.y1+hallwayWidth,dest.y2-hallwayWidth);
    let yEnd = randomIn(this.y1+hallwayWidth,this.y2-hallwayWidth);

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
      xStart = randomIn(this.x1+hallwayWidth,this.x2-hallwayWidth);
      xEnd = randomIn(dest.x1+hallwayWidth,dest.x2-hallwayWidth);
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
      if (destFartherUp) {
        //TODO I believe this case (dest farther left and farther up) is impossible due to the BST
      }
      else { //farther left and farther down
        h1=new Hallway(xStart, yStart, xStart+hallwayWidth, newX.y1, 'V-first');
        h2=new Hallway(newX.x2+hallwayWidth, newX.y1, h1.x2, newX.y2, 'H-middle');
        h1.subHallway=h2;
        //go DOWN to random y-coord on destination
      }
      //go remaining half-distance DOWN
      h3 = new Hallway(h2.x1, h2.y2, h2.x1+hallwayWidth, yEnd, 'V-last'); //DOWN
      h2.subHallway=h3;
    }
    this.hallway=h1;
    console.log('farther right / up?', destFartherRight, destFartherUp);
  }
}

Container.prototype.drawContents = function(ctx) {
  console.log(this);
  this.contents.map(e=>e.drawSelf(ctx));
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
  console.log(containers);
  let startPos=containers[0].randomPosToFit(playerSize);
  console.log(startPos);
  P.setPos(round5(startPos.x1),round5(startPos.y1));
  P.ctx=ctx;
  console.log(P);
  P.drawPlayer();
  // setInterval(function(){P.movePlayer(5,0);},1000);
  let hallways=flattenArr(containers.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways()));
  console.log(hallways);
  hallways.map(h=>h.drawHallway(ctx));
  for (var q=0;q<containers.length;q++) {
    for (var j=0;j<5;j++) {
      let rPosition=containers[q].randomPosToFit(5);
      let health=new Item(round5(rPosition.x1), round5(rPosition.y1));
      containers[q].contents.push(health);
    }
  }
  let entities=containers.concat(hallways).filter(e=>e);
  containers.map(c=>c.drawContents(ctx));

  P.entities=entities;
  console.log('entities',P.entities);
}

module.exports = {InitLevel, Player};
