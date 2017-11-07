import Leaf from './Leaf';
import Container from './Container';

import Player from './Player';
import Enemy from './Enemy';
import Item from './Item';

import * as UTIL from './Constants';

/*START GAME CLASS*/
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

Game.prototype.generateTeleport = function() { //TODO change to last containers
  let contaniers=this.entities.filter(e=>e.type==='container');
  //contaniers.length-1
  let tPorter=contaniers[0].contents.filter(e=>e.type==='teleporter')[0];
  tPorter.visible=true;
  tPorter.drawSelf(this.ctx);
}

Game.prototype.populateEntities = function(entities, containers) {
  //entities => object manifest like this: { type: 'health', minVal: 5, maxVal: 20, minInstances: 1, maxInstances: 5, size: 5 }];
  entities.forEach((E)=>{
    let numberOfItems = E.minInstances===E.maxInstances ? E.maxInstances : UTIL.randomIn(E.minInstances, E.maxInstances);
    for (var j=0;j<numberOfItems;j++) {
      for (var q=0;q<containers.length;q++) {
        if (E.limitToContainers) {
          if (E.limitToContainers!=='last'&&E.limitToContainers.indexOf(q)===-1) { continue; }
          else if (E.limitToContainers==='last'&&q!==containers.length-1) { continue; }
        }
          let pos=containers[q].randomPosToFit(E.size);
          if (pos) { //randomPosToFit returns false if we cannot place the item
            let itemVal=E.minVal&&E.maxVal ? UTIL.randomIn(E.minVal,E.maxVal) : E.value;
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
  });
  /*DRAW HALLWAYS BETWEEN CONTAINERS */
  let containers=leaves.map(l=>l.container);
  for (var i=0;i<leaves.length-1;i++) {
    leaves[i].container.calculateHallway(leaves[i+1].container, containers, ()=>this.generateBoard);
  }

  let hallways=UTIL.flattenArr(containers.map(c=>c.hallway).filter(e=>e).map(h=>h.getSubHallways()));
  let entityManifest = this.calculateEntitiesForLevel(this.level);
  this.populateEntities(entityManifest, containers);
  this.leaves=leaves;
  this.entities=containers.concat(hallways,leaves).filter(e=>e);
  /*POSITION PLAYER*/
  let startPos=containers[0].randomPosToFit(UTIL.playerSize);
  let tries=0;
  while (!startPos||tries>5) { startPos=containers[0].randomPosToFit(UTIL.playerSize); tries++; }
  this.P.setPos(UTIL.round5(startPos.x1),UTIL.round5(startPos.y1));
  this.P.currentLocation=containers[0];
}

Game.prototype.calculateEntitiesForLevel = function(level) {
  const weapons=[
    {name:'pebble', damage:2},
    {name:'fists', damage:5},
    {name:'hammer', damage:10},
    {name:'nun-chucks', damage:15},
    {name:'sword', damage:15},
    {name:'flamethrower', damage:25}
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
      limitToContainers: [0],
      consumedCallback: () => this.nextLevel()
    },
    {
      type: 'enemy',
      size: 5,
      value: {
        XP: UTIL.randomIn(level, level+1),
        damage: UTIL.randomIn(level*20, level*30),
        health: 1,
        level: level
      },
      minInstances: 1,
      maxInstances: 1,
      limitToContainers: [0],
      consumedCallback: () => this.generateTeleport()
    },
    {
      type: 'enemy',
      size: 5,
      value: {
        XP: UTIL.randomIn(level, level+1),
        damage: UTIL.randomIn(level*20, level*30),
        health: 1,
        level: level
      },
      minInstances: 1,
      maxInstances: 2,
      limitToContainers: [0, 1, 3, 5]
    }
  ];
}

Game.prototype.calculateEnemiesForLevel = function(level) {
  //should have one enemy per container, some blocking hallways.
}

Game.prototype.nextLevel = function () {
  if (this.level===this.lastLevel) {
    this.playerWon=true;
    this.callbackChange(this);
    return false;
  }
  this.level++;
  this.generateBoard();
  var camX = this.P.xPos;
  var camY = this.P.yPos;
  this.ctx.setTransform(1,0,0,1,0,0);
  this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
  this.ctx.translate(this.cvs.width/2-camX,this.cvs.height/2-camY);
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
    this.ctx.clip();
  }
this.drawEntities();
this.P.drawSelf(this.ctx);
if (this.hidden) { this.ctx.restore(); }
}

Game.prototype.toggleHide = function () {
  this.hidden = !this.hidden;
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
    this.ctx.clip();
  }
  this.drawEntities();
  this.P.drawSelf(this.ctx);
  if (this.hidden) { this.ctx.restore(); }
}
/*END GAME CLASS*/

export default Game;
