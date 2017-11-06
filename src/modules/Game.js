let Game = function() {

};

Game.prototype.drawEntities = function() {
  this.entities.map(e=>e.drawSelf(this.ctx));
  let contents=this.entities.map(e=>e.contents ? e.contents : null).filter(e=>e);
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
      let health=new Item(round5(rPosition.x1), round5(rPosition.y1), 10, 'health');
      containers[q].contents.push(health);
    }
  }
  this.leaves=leaves;
  this.entities=containers.concat(hallways,leaves).filter(e=>e);
  console.log(this.entities);
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
}

module exports = {Game};
