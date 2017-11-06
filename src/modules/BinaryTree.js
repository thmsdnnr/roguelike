let ctx, currentElement;
let level=1;

let Hallway = function(x1, y1, x2, y2, direction) {
  this.x1=x1;
  this.y1=y1;
  this.x2=x2;
  this.y2=y2;
  this.direction=direction;
  this.connectsNodes=null;
  this.subHallway=null;
  this.fillStyle=null;
  this.visible=true;
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
  ctx.strokeStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  ctx.fillStyle=`rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`;
  halls.forEach((hall)=>{
    if (!hall.fillStyle) {
      let grd=ctx.createLinearGradient(hall.x1,hall.y1,hall.x2,hall.y2);
      grd.addColorStop(0, `rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`);
      grd.addColorStop(0.5, `rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`);
      grd.addColorStop(1,'#480048');
      hall.fillStyle=grd;
    }
    ctx.fillStyle=hall.fillStyle;
    ctx.fillRect(hall.x1, hall.y1, hall.x2-hall.x1, hall.y2-hall.y1);
  });
}

let Player = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.ctx=null;
  this.health=50;
  this.XP=1;
  this.level=1;
}

let Item = function(xPos, yPos, size, type, value, consumedCallback, visible) {
  this.xPos=xPos;
  this.yPos=yPos;
  this.size=size;
  this.type=type;
  this.value=value;
  this.consumedCallback=consumedCallback;
  this.visible=visible;
}

Item.prototype.drawSelf = function(ctx) {
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
    console.log(this);
  }
}

Player.prototype.currentlyInside = function() {
  return this.currentLocation;
}

Player.prototype.animate = function(ctx) {
  let red='#F00';
  let white='#FFF';
  ctx.fillStyle=red;
  console.log('player animate');
  let animCt=0;
  let interval=setInterval(()=>{
    if (animCt===6) {
      clearInterval(interval);
      ctx.clearRect(this.xPos,this.yPos,playerSize,playerSize);
      ctx.fillStyle=white;
      ctx.fillRect(this.xPos,this.yPos,playerSize,playerSize);
    }
    animCt++;
    ctx.clearRect(this.xPos,this.yPos,playerSize,playerSize);
    animCt%2!==0 ? ctx.fillStyle=white : ctx.fillStyle=red;
    ctx.fillRect(this.xPos,this.yPos,playerSize,playerSize);
    console.log('animation whoa');
  },100);
}

Player.prototype.consume = function(e) {
  console.log(e);
  const type=e.type;
  switch (e.type) {
    case 'health': this.hasOwnProperty(type) ?  this[type]+=e.value : this[type]=e.value; break;
    case 'teleporter': break; //TODO weapon handling, eliminate duplicates
    case 'weapon': this.hasOwnProperty(type) ?  this[type]=this[type].concat(e.value) : this[type]=[e.value]; break;
  }
  this.callbackChange(this);
  console.log('consume',this);
}

Player.prototype.drawSelf = function(ctx) {
  ctx.fillStyle='#FFF';
  ctx.fillRect(this.xPos,this.yPos,playerSize,playerSize);
}

Player.prototype.setPos = function(xPos, yPos) {
  this.xPos=xPos;
  this.yPos=yPos;
}

const fight = (a,b) => {
  console.log('fight',a,b);
  if (a.health>0&&b.health>0) {
    let aDamage=a.level*randomIn(2,5); //TODO damage cts etc
    let bDamage=b.level*randomIn(1,3);
    a.health-=bDamage;
    b.health-=aDamage;
    return false;
  }
  else if (a.health<=0) {
    console.log('you died sorry');
    return false;
    //reset game
  }
  else {
    a.XP+=b.gainFromKill;
    return true;
    //player wins
  }
};

Player.prototype.movePlayer = function(xAmt, yAmt, ctx) {
  let currentEl=this.currentlyInside();
  let nextEl = this.currentLocation.isMoveAllowed(this.xPos+xAmt, this.yPos+yAmt);
  if (nextEl) {
    this.currentLocation=nextEl;
    let touching=currentEl.isTouchingItem(this.xPos+xAmt, this.yPos+yAmt);
    console.log(touching,'t');
    if (touching.type==='enemy') {
      this.animate(ctx);
      touching.animate(ctx);
      if (fight(this,touching)) {
        touching.consume(ctx, currentEl.fillStyle);
      }
      console.log('f'); return false;
    }
    else if (touching&&!touching.consumed){
      this.consume(touching);
      touching.consume(ctx, currentEl.fillStyle);
    }
    ctx.fillStyle=currentEl.fillStyle;
    ctx.strokeStyle=currentEl.fillStyle;
    ctx.clearRect(this.xPos,this.yPos,5,5);
    ctx.fillRect(this.xPos,this.yPos,5,5);
    this.xPos+=xAmt;
    this.yPos+=yAmt;
    this.drawSelf(ctx);
  }
  else { console.log('cannot go to there'); }
}

const flattenArr = (arr) => [].concat(...arr);
const round5 = (x) => Math.ceil(x/5)*5;
const randomIn = (min,max) => Math.floor(Math.random()*(max-min))+min;
const rF = (min,max) => Math.floor(Math.random()*(max-min))+min;
const hallwayWidth = 10;
const minLeafSize=40;
const maxLeafSize=200;
const desiredNumberOfLeaves=20;
const playerSize = 5;
const gameWidth=1500;
const gameHeight=1500;

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
  this.visible=true;
}

let Container = function(x1, y1, x2, y2) {
  this.x1=x1;
  this.y1=y1;
  this.x2=x2;
  this.y2=y2;
  this.hallway=null;
  this.fillStyle=null;
  this.contents=[]; //contents is an array of entities
  this.visible=true;
}

Container.prototype.isTouchingItem = function(xPos, yPos) {
  let ableToTouch=this.contents.filter(e=>!e.consumed&&e.visible);
  for (var i=0;i<ableToTouch.length;i++) { //TODO optimize
    const e=ableToTouch[i];
    if (((xPos<e.xPos+e.size)&&(xPos>=e.xPos))&&
        ((yPos<e.yPos+e.size)&&(yPos>=e.yPos)))
    {
      console.log('consume');
      return e;
    }
  }
  return false;
}

Container.prototype.isMoveAllowed = function(newX, newY) {
  let nLowerX=newX;
  let nUpperX=newX+playerSize;
  let nLowerY=newY;
  let nUpperY=newY+playerSize;
  if ((nLowerX>=this.x1&&nUpperX<=this.x2)&&(nLowerY>=this.y1&&nUpperY<=this.y2)) {
    return this;
  }
  else if (this.hallway) {
    if ((nLowerX>=this.hallway.x1&&nUpperX<=this.hallway.x2)&&(nLowerY>=this.hallway.y1&&nUpperY<=this.hallway.y2)) {
      return this.hallway;
    }
  }
  else if (this.prevHallway) {
    if ((nLowerX>=this.prevHallway.x1&&nUpperX<=this.prevHallway.x2)&&(nLowerY>=this.prevHallway.y1&&nUpperY<=this.prevHallway.y2)) {
      return this.prevHallway;
    }
  }
  else { return false; }
}

Hallway.prototype.isTouchingItem = function() { return false; }

Hallway.prototype.isMoveAllowed = function(newX, newY) {
    //if within hallway, or if going into new hallway or container, yes
    let nLowerX=newX;
    let nUpperX=newX+playerSize;
    let nLowerY=newY;
    let nUpperY=newY+playerSize;
    if ((nLowerX>=this.x1&&nUpperX<=this.x2)&&
    (nLowerY>=this.y1&&nUpperY<=this.y2)) {
      return this;
    }
    else if (this.connectsNodes) {
      let prevC=this.connectsNodes[0];
      let nextC=this.connectsNodes[1];

      let nLowerX=newX;
      let nUpperX=newX+playerSize;
      let nLowerY=newY;
      let nUpperY=newY+playerSize;

      if ((nLowerX>=prevC.x1&&nUpperX<=prevC.x2)&&
      (nLowerY>=prevC.y1&&nUpperY<=prevC.y2)) {
        return prevC;
      }
      else if ((nLowerX>=nextC.x1&&nUpperX<=nextC.x2)&&
      (nLowerY>=nextC.y1&&nUpperY<=nextC.y2)) {
        return nextC;
      }
    }
    else {
      return false;
    }
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
  if (!C.fillStyle) {
    // let grd=ctx.createLinearGradient(C.x1,C.y1,C.x2,C.y2);
    // grd.addColorStop(0, `rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`);
    // grd.addColorStop(0.5, `rgba(${rF(0,255)},${rF(0,255)},${rF(0,255)},1.0)`);
    // grd.addColorStop(1,'#480048');
    // C.fillStyle=grd;
    C.fillStyle='#CCC';
  }
  ctx.fillStyle=C.fillStyle;
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

  if (splitVertical) {
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
  for (var m=0;m<10;m++) { //try ten random placements
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
  let widthRO=rangeOverlap([dest.x1,dest.x2],[this.x1, this.x2]);
  let heightRO=rangeOverlap([dest.y1, dest.y2],[this.y1, this.y2]);
  if ((widthRO[1]-widthRO[0]>0)&&((widthRO[1]-widthRO[0])>hallwayWidth)) {
    let xCoord=round5(randomIn(widthRO[0]+hallwayWidth, widthRO[1]-hallwayWidth));
    let yCoord=round5(this.y2);
    let distance=dest.y1-this.y2;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+hallwayWidth, yCoord+distance,'V');
    this.hallway.connectsNodes=[this, dest];
    dest.prevHallway=this.hallway;
  }
  else if ((heightRO[1]-heightRO[0]>0)&&((heightRO[1]-heightRO[0])>hallwayWidth)) {
    let yCoord=round5(randomIn(heightRO[0]+hallwayWidth, heightRO[1]-hallwayWidth));
    let xCoord=round5(this.x2);
    let distance=dest.x1-this.x2;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+distance, yCoord+hallwayWidth, 'H');
    this.hallway.connectsNodes=[this, dest];
    dest.prevHallway=this.hallway;
  }
  else {
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
      xStart=this.x2;
      xEnd=dest.x1;

      let potentialRects=[];
      //possible hallways: anything between xStart and xEnd
      //random hallway value between xStart+1+hallwayWidth and xEnd-1-hallwayWidth
      //check for entity intersection at each width for height from yStart to yEnd
      for (var i=0;i+hallwayWidth+xStart<xEnd;i++) {
        potentialRects.push({
          x1:round5(xStart+i),
          x2:round5(xStart+i+hallwayWidth),
          y1:round5(yStart),
          y2:round5(yEnd)
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

      let newY=testedOptions[Math.floor(testedOptions.length/2)];
      if (!newY) { return false; } //cannot construct a hallway
      if (destFartherUp) {
        h1=new Hallway(xStart, newY.y2, newY.x1, newY.y2+hallwayWidth, 'H-first');
        h2=new Hallway(h1.x2, newY.y1, newY.x2, newY.y2+hallwayWidth, 'V-middle');
        h1.subHallway=h2;
        h1.connectsNodes=[this, h2];
      }
      else { //TODO this doesnt seem to matter up or down we just draw it
        //go DOWN to random y-coord on destination
        // h2=new Hallway(h1.x2, h1.y2, xStart+hallwayWidth+xDistance/2, yEnd, 'V');
        // h1.subHallway=h2;
      }
      //go remaining half-distance LEFT
      h3 = new Hallway(h2.x2, yStart, xStart+xDistance, yStart+hallwayWidth, 'H-last');
      h2.subHallway=h3;
      h2.connectsNodes=[h1, h3];
      h3.connectsNodes=[h2, dest];
      dest.prevHallway=h3;
    }
    else { //farther left, start down TODO or up
      xStart = round5(randomIn(this.x1+hallwayWidth,this.x2-hallwayWidth));
      xEnd = round5(randomIn(dest.x1+hallwayWidth,dest.x2-hallwayWidth));
      yStart = this.y2;
      yEnd = dest.y1;

      let potentialRects=[]; //test different y-values
      for (var i=0;i+hallwayWidth+yStart<yEnd;i++) {
        potentialRects.push({
          x1:round5(xStart),
          x2:round5(xEnd),
          y1:round5(yStart+i),
          y2:round5(yStart+i+hallwayWidth)
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
        h1.connectsNodes=[this, h2];
      }
        //go DOWN to random y-coord on destination
      //go remaining half-distance DOWN
      h3 = new Hallway(h2.x1, h2.y2, h2.x1+hallwayWidth, yEnd, 'V-last'); //DOWN
      h2.subHallway=h3;
      h2.connectsNodes=[h1, h3];
      h3.connectsNodes=[h2, dest];
      dest.prevHallway=h3;
    }
    this.hallway=h1;
    // console.log('farther right / up?', destFartherRight, destFartherUp);
  }
}

Container.prototype.drawSelf = function(ctx) { this.contents.map(e=>e.drawSelf(ctx)); }

let Game = function() {
  this.level=1;
  this.hidden=true;
};

Game.prototype.clearCache = function() {
  this.entities=null;
  this.leaves=null;
}

Game.prototype.drawEntities = function() {
  this.entities.map(e=>e.drawSelf(this.ctx));
  //TODO test to assert everything is cenetered on 5s
  // console.log(this.entities.filter(e=>!e.id).filter(e=>((e.x1%5!==0||e.x2%5!==0)||(e.y1%5!==0||e.y2%5!==0))));
  let contents=this.entities.map(e=>e.contents ? e.contents : null).filter(e=>e);
  flattenArr(contents).filter(e=>e.visible&&!e.consumed).map(s=>s.drawSelf(this.ctx));
}

Game.prototype.generateTeleport = function() { //TODO change to last containers
  let tPorter=this.entities.map(e=>e.contents)[0].filter(e=>e.type==='teleporter')[0];
  tPorter.visible=true;
  tPorter.drawSelf(this.ctx);
}

Game.prototype.populateEntities = function(entities, containers) {
  /*
  entities is an object manifest like this:
  { type: 'health', minVal: 5, maxVal: 20, minInstances: 1, maxInstances: 5, size: 5 }];
*/
  entities.forEach((E)=>{
    let numberOfItems = E.minInstances===E.maxInstances ? E.maxInstances : randomIn(E.minInstances, E.maxInstances);
    for (var j=0;j<numberOfItems;j++) {
      for (var q=0;q<containers.length;q++) {
        if (E.limitToContainers) {
          if (!E.limitToContainers==='last'&&E.limitToContainers.indexOf(q)===-1) { continue; }
          else if (E.limitToContainers==='last'&&q!==containers.length-1) { continue; }
        }
          let pos=containers[q].randomPosToFit(E.size);
          if (pos) { //randomPosToFit returns false if we cannot place the item
            let itemVal=E.minVal&&E.maxVal ? randomIn(E.minVal,E.maxVal) : E.value;
            switch (E.type) { //TODO refine switch
              case 'enemy': containers[q].contents.push(new Enemy(pos.x1, pos.y1,E.value.XP,E.value.damage,E.value.health,this.level,E.consumedCallback)); break;
              default: containers[q].contents.push(new Item(pos.x1, pos.y1, E.size, E.type, itemVal, E.consumedCallback, E.visible));
            }
          }
        }
      }
  });
}

Game.prototype.generateBoard = function() {
  console.log('called',this);
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
  this.P.currentLocation=containers[0];
  let hallways=flattenArr(containers.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways()));

  let entityManifest = this.calculateEntitiesForLevel(this.level);
  this.populateEntities(entityManifest, containers);
  this.leaves=leaves;
  this.entities=containers.concat(hallways,leaves).filter(e=>e);
  console.log(this.entities);
}

Game.prototype.calculateEntitiesForLevel = function(level) {
  const weapons=[
    {name:'fists', damage:5},
    {name:'rocks', damage:5},
    {name:'hammer', damage:10},
    {name:'chisel', damage:10},
    {name:'nun-chucks', damage:15},
    {name:'sword', damage:15},
    {name:'cannon', damage:15},
    {name:'thePowerOfMind', damage:15}
  ];

  const enemies=[
    {name:'fists', damage:5},
    {name:'rocks', damage:5},
    {name:'hammer', damage:10},
    {name:'chisel', damage:10},
    {name:'nun-chucks', damage:15},
    {name:'sword', damage:15},
    {name:'cannon', damage:15},
    {name:'thePowerOfMind', damage:15}
  ];


  return [
    {
      type: 'health',
      visible: true,
      size: 5,
      minVal: 5,
      maxVal: 20,
      minInstances: 2,
      maxInstances: 5
    },
    {
      type: 'weapon',
      visible: true,
      size: 10,
      value: weapons[0],
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: [0,1]
    },
    {
      type: 'teleporter',
      visible: false,
      size: 20,
      minVal: 5,
      maxVal: 6,
      minInstances: 1,
      maxInstances: 2,
      limitToContainers: [0],
      consumedCallback: () => this.nextLevel()
    },
    {
      type: 'enemy',
      size: 5,
      value: {
        XP: randomIn(level, level+1),
        damage: randomIn(level*10, level*20),
        health: 50,
        level: level
      },
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: [0], //TODO switch generateTeleport to BOSS for container
      consumedCallback: () => this.generateTeleport()
    },
    {
      type: 'enemy', //boss
      size: 5,
      value: {
        XP: randomIn(level, level+1),
        damage: randomIn(level*10, level*20),
        health: 50,
        level: level
      },
      minInstances: 1,
      maxInstances: 2,
      limitToContainers: 'last'
    }
  ];
}

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
  this.health=50||health;
  this.level=level;
  this.gainFromKill=Math.floor(XP/level);
  this.consumedCallback=consumedCallback;
}

Enemy.prototype.drawSelf = function(ctx) {
  if (this.consumed) { return false; }
  ctx.fillStyle='#FF0000';
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
}

Enemy.prototype.animate = function(ctx) {
  let red='#F00';
  let orange='#A0E';
  ctx.fillStyle=red;
  console.log('player animate');
  let animCt=0;
  let interval=setInterval(()=>{
    if (animCt===7) {
      clearInterval(interval);
      ctx.clearRect(this.xPos,this.yPos,playerSize,playerSize);
      ctx.fillStyle=orange;
      ctx.fillRect(this.xPos,this.yPos,playerSize,playerSize);
    }
    animCt++;
    ctx.clearRect(this.xPos,this.yPos,playerSize,playerSize);
    animCt%2!==0 ? ctx.fillStyle=orange : ctx.fillStyle=red;
    ctx.fillRect(this.xPos,this.yPos,playerSize,playerSize);
    console.log('animation whoa');
  },100);
}

Enemy.prototype.consume = function(ctx, oldBackgroundColor) {
  ctx.fillStyle=oldBackgroundColor;
  ctx.fillRect(this.xPos,this.yPos,this.size,this.size);
  this.consumed=true;
  console.log(this.consumedCallback);
  if (this.consumedCallback) { console.log('called'); this.consumedCallback(); }
}

Game.prototype.calculateEnemiesForLevel = function(level) {
  //should have one enemy per container, some blocking hallways.
}

Game.prototype.nextLevel = function () {
  this.level++;
  this.ctx.clearRect(0, 0, gameWidth, gameHeight);//clear the viewport AFTER the matrix is reset
  this.ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
  this.generateBoard();
  var camX = this.P.xPos;
  var camY = this.P.yPos;
  this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
  this.drawEntities();
  this.P.drawSelf(this.ctx);
}

Game.prototype.toggleHide = function () {
  this.hidden = !this.hidden;
}

Game.prototype.initLevel = function(P) {
  this.cvs = document.getElementById('game');
  this.ctx = this.cvs.getContext('2d');
  ctx=this.ctx;
  if(P) { this.P=P; }
  this.generateBoard();
  var camX = this.P.xPos;
  var camY = this.P.yPos;

  if (this.hidden) {
    this.ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);//clear the viewport AFTER the matrix is reset
    //Clamp the camera position to the world bounds while centering the camera around the player
    this.ctx.fillStyle='#000';
    this.ctx.fillRect(0,0,this.cvs.width,this.cvs.height);
    this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(camX, camY, 100, 0, Math.PI * 2, false);
    this.ctx.clip();
  }
  this.drawEntities();
  this.P.drawSelf(this.ctx);
  if (this.hidden) { this.ctx.restore(); }
}

module.exports = {Game, Player};
