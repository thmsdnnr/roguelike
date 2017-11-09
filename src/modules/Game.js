import Leaf from './Leaf';
// import Container from './Container';
// import Player from './Player';
import Enemy from './Enemy';
import Item from './Item';
import * as UTIL from './Constants';

let Game = function() {
  this.level=1;
  this.hidden=true;
  this.hint=true;
  this.lastLevel=5;
  this.playerWon=false;
};

Game.prototype.drawEntities = function() {
  this.entities.map(e=>e.drawSelf(this.ctx));
  let contents=this.entities.map(e=>e.contents ? e.contents : null).filter(e=>e);
  UTIL.flattenArr(contents).filter(e=>e.visible&&!e.consumed).map(s=>s.drawSelf(this.ctx));
}

Game.prototype.generateTeleport = function(enemyCoords) {
  let containers=this.entities.filter(e=>e.type==='container');
  let tIndex=containers.length-1; //last container
  let tPorter=containers[tIndex].contents.filter(e=>e.type==='teleporter')[0];
  containers[tIndex].teleporterVisible=true;
  containers[tIndex].teleporter=tPorter;
  this.displayMsg('Teleport to the next level friend!');
  tPorter.visible=true;
  tPorter.drawSelf(this.ctx);
}

Game.prototype.populateEntities = function(entities, containers) {
  /*entities is an object manifest like this:
  { type: 'health', minVal: 5, maxVal: 20, minInstances: 1, maxInstances: 5, size: 5 }]; */
  entities.forEach((E)=>{
    let numberOfItems = E.minInstances===E.maxInstances ? E.maxInstances : UTIL.randomIn(E.minInstances, E.maxInstances);
    for (var j=0;j<numberOfItems;j++) {
      for (var q=0;q<containers.length;q++) {
        if (E.limitToContainers) {
          if (E.limitToContainers!=='last'&&E.limitToContainers.indexOf(q)===-1) { continue; }
          else if (E.limitToContainers==='last'&&q!==containers.length-1) { continue; }
        }
        if (E.excludeFromContainers) {
          if (E.excludeFromContainers!=='last'&&E.excludeFromContainers.indexOf(q)!==-1) { continue; }
          else if (E.excludeFromContainers==='last'&&q===containers.length-1) { continue; }
        }
        if (E.type==='teleporter') {
          let xCenter=containers[q].x1+10;
          let yCenter=containers[q].y1+10;
          containers[q].clearContentsFromCoords(xCenter, yCenter, E.size);
          containers[q].contents.push(new Item(xCenter, yCenter, E.size, E.type, E.value, E.consumedCallback, E.visible, this.displayMsg));
        }
          let pos=containers[q].randomPosToFit(E.size);
          if (pos) { //randomPosToFit returns false if we cannot place the item
            let itemVal=E.minVal&&E.maxVal ? UTIL.randomIn(E.minVal,E.maxVal) : E.value;
            switch (E.type) {
              case 'enemy': containers[q].contents.push(new Enemy(pos.x1, pos.y1, E.size, E.value.XP, E.value.damage, E.value.health, this.level, E.consumedCallback)); break;
              //weapons or healths
              default: containers[q].contents.push(new Item(pos.x1, pos.y1, E.size, E.type, itemVal, E.consumedCallback, E.visible, this.displayMsg));
            }
          }
        }
      }
  });
}

Game.prototype.generateBoard = function() {
  this.cvs = this.cvs ? this.cvs : document.getElementById('game');
  this.ctx = this.ctx ? this.ctx : this.cvs.getContext('2d');

  /* CREATE LEAVES */
  let root = new Leaf(0,0,UTIL.gameWidth,UTIL.gameHeight);
  let leafLitter=[root];
  let didSplit=true;
  while (didSplit) {
    didSplit=false;
    leafLitter.forEach((leaf)=>{
      if (leaf.left===null&&leaf.right===null) {
        if (leaf.splitLeaf()&&leafLitter.length<UTIL.desiredNumberOfLeaves) {
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
    leaf.container.ctx=this.ctx;
    if (idx===leaves.length-1) {
      leaf.container.bossContainer=true;
    }
  });
  /*DRAW HALLWAYS BETWEEN CONTAINERS */
  let containers=leaves.map(l=>l.container);
  for (var i=0;i<leaves.length-1;i++) {
    leaves[i].container.calculateHallway(leaves[i+1].container, containers, this.initLevel);
  }
  let hallways=UTIL.flattenArr(containers.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways()));
  let entityManifest = this.calculateEntitiesForLevel(this.level);
  this.populateEntities(entityManifest, containers);
  this.leaves=leaves;
  this.entities=containers.concat(hallways,leaves).filter(e=>e);
  /*POSITION PLAYER*/
  let startPos=containers[0].randomPosToFit(UTIL.playerSize);
  let tries=0;
  while (!startPos||tries<5) { startPos=containers[0].randomPosToFit(UTIL.playerSize); tries++; }
  this.P.setPos(UTIL.round5(startPos.x1),UTIL.round5(startPos.y1));
  this.P.currentLocation=containers[0];
}

Game.prototype.calculateEntitiesForLevel = function(level) {
  const weapons=[
    {name:'pebble', damage:2},
    {name:'fists', damage:5},
    {name:'hammer', damage:10},
    {name:'nun-chucks', damage:15},
    {name:'sword', damage:20},
    {name:'flamethrower', damage:25}
  ];

  return [
    {
      type: 'health',
      visible: true,
      size: 5,
      minVal: (6-level)*4,
      maxVal: (6-level)*6,
      minInstances: Math.ceil(10/(level*2+5)),
      maxInstances: Math.ceil(10/(level*3+5))
    },
    {
      type: 'weapon',
      visible: true,
      size: 10,
      value: weapons[level],
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: [0]
    },
    {
      type: 'teleporter',
      visible: false,
      size: 20,
      minVal: 5,
      maxVal: 6,
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: 'last',
      consumedCallback: () => this.nextLevel()
    },
    {
      type: 'enemy', //level boss
      size: 10,
      value: {
        XP: UTIL.randomIn(10, 12),
        damage: UTIL.randomIn(level*10, level*15),
        health: (level+1)*20,
        level: level
      },
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: 'last',
      consumedCallback: (enemyCoords) => this.generateTeleport(enemyCoords)
    },
    {
      type: 'enemy', //std enemies
      size: 5,
      value: {
        XP: UTIL.randomIn(5, 8),
        damage: UTIL.randomIn(5,10)*level,
        health: (level+1)*5,
        level: level
      },
      minInstances: 1,
      maxInstances: 1,
      excludeFromContainers: 'last'
    }
  ];
}

Game.prototype.playerWon = function () {
  this.playerWon=true;
  this.callbackChange(this);
}

Game.prototype.nextLevel = function () {
  if (this.level===this.lastLevel) {
    this.playerWon=true;
    this.callbackChange(this);
    return false;
  }
  this.level++;
  this.callbackChange(this);
  this.generateBoard();
  this.redraw();
}

Game.prototype.toggleHide = function () {
  this.hidden = !this.hidden;
}

Game.prototype.redraw = function() {
  this.ctx.setTransform(1,0,0,1,0,0);
  this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  var camX = this.P.xPos;
  var camY = this.P.yPos;
  if (this.hidden) {
    this.ctx.fillStyle='#000';
    this.ctx.fillRect(0,0,this.cvs.width,this.cvs.height);
  }
  this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
  if (this.hidden) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = 'green';
    this.ctx.arc(camX, camY, 100, 0, Math.PI * 2, false);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(camX, camY, 95, 0, Math.PI * 2, false);
    this.ctx.clip();
  }
  this.drawEntities();
  this.P.drawSelf(this.ctx);
  if (this.hidden) { this.ctx.restore(); }
}

Game.prototype.initLevel = function(P) {
  this.cvs = document.getElementById('game');
  this.ctx = this.cvs.getContext('2d');
  this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

  if(P) { this.P=P; }
  this.generateBoard();
  var camX = this.P.xPos;
  var camY = this.P.yPos;

  if (this.hidden) {
    this.ctx.setTransform(1,0,0,1,0,0);
    this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
    this.ctx.fillStyle='#000';
    this.ctx.fillRect(0,0,this.cvs.width,this.cvs.height);
    this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = 'green';
    this.ctx.arc(camX, camY, 100, 0, Math.PI * 2, false);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(camX, camY, 95, 0, Math.PI * 2, false);
    this.ctx.clip();
  }
  this.drawEntities();
  this.P.drawSelf(this.ctx);
  if (this.hidden) { this.ctx.restore(); }
}

export default Game;
