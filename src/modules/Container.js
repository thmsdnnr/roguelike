import Hallway from './Hallway';
import * as UTIL from './Constants';

let Container = function(x1, y1, x2, y2) {
  this.x1=x1;
  this.y1=y1;
  this.x2=x2;
  this.y2=y2;
  this.hallway=null;
  this.fillStyle=null;
  this.contents=[];
  this.visible=true;
  this.type='container'
}

Container.prototype.isTouchingItem = function(xPos, yPos) {
  let playerRect={x1:xPos,x2:xPos+UTIL.playerSize,y1:yPos,y2:yPos+UTIL.playerSize};
  let ableToTouch=this.contents.filter(e=>!e.consumed&&e.visible);
  for (var i=0;i<ableToTouch.length;i++) {
    const e=ableToTouch[i];
    let itemRect={x1:e.xPos,x2:e.xPos+e.size,y1:e.yPos,y2:e.yPos+e.size};
    if (UTIL.doesCollide(playerRect,itemRect)) {
      return e;
    }
  }
  return false;
}

Container.prototype.isMoveAllowed = function(newX, newY) {
  let playerRect={x1:newX,x2:newX+UTIL.playerSize,y1:newY,y2:newY+UTIL.playerSize};
  let spaceRect={x1:this.x1,x2:this.x2,y1:this.y1,y2:this.y2};
  if (UTIL.doesCollide(playerRect, spaceRect)) { return this; }
  if (this.hallway) {
    let H=this.hallway;
    let hallwayRect={x1:H.x1,x2:H.x2,y1:H.y1,y2:H.y2};
    if (UTIL.doesCollide(playerRect, hallwayRect)) { return this.hallway; }
  }
  if (this.prevHallway) {
    let H=this.prevHallway;
    let hallwayRect={x1:H.x1,x2:H.x2,y1:H.y1,y2:H.y2};
    if (UTIL.doesCollide(playerRect, hallwayRect)) { return this.prevHallway; }
  }
  return false;
}

Container.prototype.clearContentsFromCoords = function (xPos, yPos, size) {
  let clearRect = {x1:xPos, x2:xPos+size, y1:yPos, y2:yPos+size};
  this.contents=this.contents.filter(e=>{
    let itemRect={x1:e.xPos, x2:e.xPos+size, y1:e.yPos, y2:e.yPos+size};
    return UTIL.doesCollide(clearRect,itemRect);
  });
}

Container.prototype.randomPosToFit = function (size, padding) {
  if (!this.contents.length) {
    let randX=UTIL.round5(UTIL.randomIn(this.x1,(this.x2-size)));
    let randY=UTIL.round5(UTIL.randomIn(this.y1,(this.y2-size)));
    return {
      x1:randX,
      y1:randY,
      x2:randX+size,
      y2:randY+size
    };
  }
  for (var m=0;m<10;m++) { //try ten random placements
    let randX=UTIL.round5(UTIL.randomIn(this.x1,(this.x2-size)));
    let randY=UTIL.round5(UTIL.randomIn(this.y1,(this.y2-size)));
    let candidate={
      x1:randX,
      y1:randY,
      x2:randX+size,
      y2:randY+size
    };
    for (var i=0;i<this.contents.length;i++) {
      let I=this.contents[i];
      let contentsRect={x1:I.xPos,x2:I.xPos+I.size,y1:I.yPos,y2:I.yPos+I.size};
      if (UTIL.doesCollide(contentsRect,candidate,padding)) {
        break;
      }
      else if (i===this.contents.length-1) { return candidate; }
    }
  }
  return false;
}

Container.prototype.calculateHallway = function(dest, containerList, failToConnectCallback) {
  let widthRO=UTIL.rangeOverlap([dest.x1,dest.x2],[this.x1, this.x2]);
  let heightRO=UTIL.rangeOverlap([dest.y1, dest.y2],[this.y1, this.y2]);
  if ((widthRO[1]-widthRO[0]>0)&&((widthRO[1]-widthRO[0])>UTIL.hallwayWidth)) {
    let xCoord=UTIL.round5(UTIL.randomIn(widthRO[0]+UTIL.hallwayWidth, widthRO[1]-UTIL.hallwayWidth));
    let yCoord=UTIL.round5(this.y2);
    let distance=dest.y1-this.y2;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+UTIL.hallwayWidth, yCoord+distance,'V');
    this.hallway.connectsNodes=[this, dest];
    dest.prevHallway=this.hallway;
  }
  else if ((heightRO[1]-heightRO[0]>0)&&((heightRO[1]-heightRO[0])>UTIL.hallwayWidth)) {
    let yCoord=UTIL.round5(UTIL.randomIn(heightRO[0]+UTIL.hallwayWidth, heightRO[1]-UTIL.hallwayWidth));
    let xCoord=UTIL.round5(this.x2);
    let distance=dest.x1-this.x2;
    this.hallway=new Hallway(xCoord, yCoord, xCoord+distance, yCoord+UTIL.hallwayWidth, 'H');
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

    let yStart = UTIL.round5(UTIL.randomIn(dest.y1+UTIL.hallwayWidth,dest.y2-UTIL.hallwayWidth));
    let yEnd = UTIL.round5(UTIL.randomIn(this.y1+UTIL.hallwayWidth,this.y2-UTIL.hallwayWidth));

    let xStart, xEnd;
    let h1, h2, h3;
    if (destFartherRight) {
      //if destFartherRight, pick random y-coord to start from on this
      xStart=this.x2;
      xEnd=dest.x1;
      let potentialRects=[];
      /*possible hallways: anything between xStart and xEnd
      random hallway value between xStart+1+UTIL.hallwayWidth and xEnd-1-UTIL.hallwayWidth
      check for entity intersection at each width for height from yStart to yEnd*/
      for (var i=5;i+UTIL.hallwayWidth+xStart<xEnd;i+=5) { //potential vertical rect
        potentialRects.push({
          x1:xStart+i,
          x2:xStart+i+UTIL.hallwayWidth,
          y1:yStart,
          y2:yEnd
        });
      }
      let testedOptions=[];
      let good=true;
      let possibleCollide=containerList.concat(UTIL.flattenArr(containerList.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways())));
      for (var i=0;i<potentialRects.length;i++) {
        for (var j=0;j<possibleCollide.length;j++) {
          if (UTIL.doesCollide(potentialRects[i],possibleCollide[j])) { break; }
          else if (j===possibleCollide.length-1) {
            testedOptions.push(potentialRects[i]);
          }
        }
      }
      let newY=testedOptions[Math.floor(testedOptions.length/2)];
      if (!newY) { //cannot construct a hallway
        failToConnectCallback();
        return false;
      }
      if (destFartherUp) {
        h1=new Hallway(xStart, newY.y2, newY.x1, newY.y2+UTIL.hallwayWidth, 'H-first');
        h2=new Hallway(h1.x2, newY.y1, newY.x2, newY.y2+UTIL.hallwayWidth, 'V-middle');
        h1.subHallway=h2;
        h1.connectsNodes=[this, h2];
      }
      h3 = new Hallway(h2.x2, yStart, xStart+xDistance, yStart+UTIL.hallwayWidth, 'H-last');
      h2.subHallway=h3;
      h2.connectsNodes=[h1, h3];
      h3.connectsNodes=[h2, dest];
      dest.prevHallway=h3;
    }
    else { //farther left
      xStart = UTIL.round5(UTIL.randomIn(this.x1+UTIL.hallwayWidth,this.x2-UTIL.hallwayWidth));
      xEnd = UTIL.round5(UTIL.randomIn(dest.x1+UTIL.hallwayWidth,dest.x2-UTIL.hallwayWidth*2));
      yStart = this.y2;
      yEnd = dest.y1;

      let potentialRects=[]; //test different y-values
      for (var i=5;i+UTIL.hallwayWidth+yStart<yEnd;i+=5) {
        potentialRects.push({ //possible horizontal rect
          x1:xStart,
          x2:xEnd,
          y1:yStart+i,
          y2:yStart+i+UTIL.hallwayWidth
        });
      }
      let testedOptions=[];
      let good=true;
      let possibleCollide=containerList.concat(UTIL.flattenArr(containerList.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways())));
      for (var i=0;i<potentialRects.length;i++) {
        for (var j=0;j<possibleCollide.length;j++) {
          if (UTIL.doesCollide(potentialRects[i],possibleCollide[j])) { break; }
          else if (j===possibleCollide.length-1) {
            testedOptions.push(potentialRects[i]);
          }
        }
      }

      let newX=testedOptions[Math.floor(testedOptions.length/2)];
      if (!newX) { //cannot construct a hallway
        failToConnectCallback();
        return false;
      }
      if (!destFartherUp) { //farther left and farther down
        h1=new Hallway(xStart, yStart, xStart+UTIL.hallwayWidth, newX.y1, 'V-first');
        h2=new Hallway(newX.x2+UTIL.hallwayWidth, newX.y1, h1.x2, newX.y2, 'H-middle');
        h1.subHallway=h2;
        h1.connectsNodes=[this, h2];
      }
      h3 = new Hallway(h2.x1, h2.y2, h2.x1+UTIL.hallwayWidth, yEnd, 'V-last'); //DOWN
      h2.subHallway=h3;
      h2.connectsNodes=[h1, h3];
      h3.connectsNodes=[h2, dest];
      dest.prevHallway=h3;
    }
    this.hallway=h1;
  }
}

Container.prototype.drawSelf = function() {
  this.contents.filter(e=>e.visible&&!e.consumed).map(e=>e.drawSelf(this.ctx));
}

export default Container;
