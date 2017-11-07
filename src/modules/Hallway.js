import * as UTIL from './Constants';

/*Start Hallway Class */
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
  this.type='hallway';
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
  ctx.strokeStyle=`rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`;
  ctx.fillStyle=`rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`;
  halls.forEach((hall)=>{
    if (!hall.fillStyle) {
      let grd=ctx.createLinearGradient(hall.x1,hall.y1,hall.x2,hall.y2);
      grd.addColorStop(0, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
      grd.addColorStop(0.5, `rgba(${UTIL.rF(0,255)},${UTIL.rF(0,255)},${UTIL.rF(0,255)},1.0)`);
      grd.addColorStop(1,'#480048');
      hall.fillStyle=grd;
    }
    ctx.fillStyle=hall.fillStyle;
    ctx.fillRect(hall.x1, hall.y1, hall.x2-hall.x1, hall.y2-hall.y1);
  });
}

Hallway.prototype.isTouchingItem = function() { return false; }

Hallway.prototype.isMoveAllowed = function(newX, newY) {
    //if within hallway, or if going into new hallway or container, yes
    let playerRect={x1:newX,x2:newX+UTIL.playerSize,y1:newY,y2:newY+UTIL.playerSize};
    let spaceRect={x1:this.x1,x2:this.x2,y1:this.y1,y2:this.y2};
    if (UTIL.doesCollide(playerRect,spaceRect)) { return this; }
    if (this.connectsNodes) {
      let prevC=this.connectsNodes[0];
      let prevRect={x1:prevC.x1,x2:prevC.x2,y1:prevC.y1,y2:prevC.y2};
      if (UTIL.doesCollide(playerRect,prevRect)) { return prevC; }
      let nextC=this.connectsNodes[1];
      let nextRect={x1:nextC.x1,x2:nextC.x2,y1:nextC.y1,y2:nextC.y2};
      if (UTIL.doesCollide(playerRect,nextRect)) { return nextC; }
    }
    else { return false; }
}
/*End Hallway Class */
export default Hallway;
