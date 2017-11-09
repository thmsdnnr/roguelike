export const ANIMATION_REPEAT_INTERVAL=50; //ms
export const flattenArr = (arr) => [].concat(...arr);
export const round5 = (x) => Math.floor(x/5)*5;
export const randomIn = (min,max) => Math.floor(Math.random()*(max-min))+min;
export const rF = (min,max) => Math.floor(Math.random()*(max-min))+min;
export const hallwayWidth = 10;
export const minLeafSize=50;
export const maxLeafSize=100;
export const desiredNumberOfLeaves=10;
export const playerSize = 5;
export const gameWidth=1000;
export const gameHeight=1000;
export const rangeOverlap = (a,b) => [Math.max(a[0],b[0]),Math.min(a[1],b[1])];

const levelUpCutoffs = [0, 0, 20, 50, 75, 100, 150];

export const doesCollide = (a,b) => {
  var rect1 = {x: Math.min(a.x1,a.x2), y: Math.min(a.y1,a.y2), width: Math.abs(a.x2-a.x1), height: Math.abs(a.y2-a.y1)};
  var rect2 = {x: Math.min(b.x1,b.x2), y: Math.min(b.y1,b.y2), width: Math.abs(b.x2-b.x1), height: Math.abs(b.y2-b.y1)};
  if (rect1.x < rect2.x + rect2.width &&
     rect1.x + rect1.width > rect2.x &&
     rect1.y < rect2.y + rect2.height &&
     rect1.height + rect1.y > rect2.y) {
       return true;
  }
  return false;
}

export const didLevelUp = function (level, XP) {
  let currentLevel;
  for (var i=0;i<levelUpCutoffs.length;i++) {
    if (XP<levelUpCutoffs[i]) { currentLevel=i-1; break; }
  }
  return level!==currentLevel ? currentLevel : false;
}

export const compass = function(a, b) {
  let xDist=b.x1-a.x1;
  let yDist=a.y1-b.y1;
  let yDirection = b.y1>a.y1 ? 'DOWN' : 'UP';
  //if y is down then either no xDirection or left or right
  let xDirection = b.x1>a.x1 ? 'RIGHT' : 'LEFT';
  return {xDist,yDist,xDirection,yDirection};
}

export const fight = (a,b,ctx,currentElement,callback,posX,posY) => {
  if (a.health>0&&b.health>0) {
  a.animate(ctx,()=>{
    a.health=a.health-b.attack();
      b.health=b.health-a.attack();
        b.animate(ctx,()=>{
        if (a.health<=0) {
          return a.death();
        }
        else if (b.health<=0){ //you won
          a.gainXP(b.gainFromKill);
          b.consume(ctx,currentElement.fillStyle);
          a.movePlayer(posX,posY,ctx);
          a.drawSelf(ctx);
        }
        return callback();
      });
    });
  }
};
