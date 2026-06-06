class Plant {
  constructor(x, y, d, health, imgs) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.health = health;
    this.imgs = imgs;
    this.frameIndex = 0;
  }
  
  damage(magnitude) {
    this.health = max(0, this.health - magnitude);
  }
  
  isDead() {
    return this.health <= 0;
  }
  
  getScaledDimensions() {
    let img = this.imgs[this.frameIndex];
    let aspect = img.width / img.height;
    if (aspect > 1) {
      return { w: this.d, h: this.d / aspect };
    }
    else {
      return { w: this.d * aspect, h: this.d };
    }
  }
  
  draw() {
    if (!this.imgs || this.imgs.length === 0) {
      fill(0);
      circle(this.x, this.y, this.d);
      return;
    }
    let img = this.imgs[this.frameIndex];
    imageMode(CENTER);
    let { w, h } = this.getScaledDimensions();
    image(img, this.x, this.y, w, h);
    imageMode(CORNER);
  }
}

class NativePlant extends Plant {
  constructor(x, y, d, imgs) {
    super(x, y, d, 100, imgs);
  }
  
  update() {
    if (frameCount % 20 === 0) {
      this.frameIndex = (this.frameIndex + 1) % this.imgs.length;
    }
  }
  
  draw() {
    // fill(100);
    // circle(this.x, this.y, this.d);
    super.draw();
  }
}

class InvasivePlant extends Plant {
  constructor(x, y, d, stopPoint, speed, imgs) {
    super(x, y, d, 100, imgs);
    this.stopPoint = stopPoint;
    this.speed = speed;
  }
  
  update() {
    if (frameCount % 20 === 0) {  // change 10 to control speed
      this.frameIndex = (this.frameIndex + 1) % this.imgs.length;
    }
    
    // pipes always go from right to left
    if ((this.x != this.stopPoint) && 
        (this.x - this.stopPoint > 0) == 
        ((this.x + this.speed) - this.stopPoint > 0)) {
      this.x += this.speed; 
    } else {
      this.x = this.stopPoint;
    }
  }
  
  draw() {
    super.draw();
  }
  
  circleEdgeDist(x, y, d) {
    return this.circleEdgeDist2(this.x, this.y, this.d, x, y, d);
  }
  
  circleEdgeDist2(x1, y1, d1, x2, y2, d2) {
    let centerDist = dist(x1, y1, x2, y2);
    
    let edgeDist = centerDist - ((d1 + d2) / 2);
    return max(0, edgeDist);
  }
  
  pos2Plant(x, y, d, speed) {
    let currDist = this.circleEdgeDist(x, y, d);
    if (currDist == 0) {
      return 0;
    } else if (currDist < 
        this.circleEdgeDist2(speed + this.x, 
                       this.y, this.d, x, y, d)) {
      return -1 * currDist;
    } else {
      return currDist;
    }
  }
}

class PlantRow {
  constructor(y, diameter, isRight, stopPoint, index) {
    this.stopPoint = stopPoint;
    this.d = diameter;
    this.y = y;
    this.plants = [];
    if (isRight) {
      this.xStart = width + (this.d / 2);
      this.speed = -1;
    } else {
      this.xStart = - (this.d / 2);
      this.speed = 1;
    } 
    this.index = index;
    
  }
  
  addPlant() {
    let invasiveKeys = Object.keys(invasiveImgs);
    let imgs = invasiveImgs[invasiveKeys[this.index % invasiveKeys.length]];
    this.plants.push(new InvasivePlant(this.xStart, this.y, this.d, this.stopPoint, this.speed, imgs));
  }
  
  damage(x, y, d, magnitude) {
    let currDead = [];
    // for each plant -> check if it is in damage radius
    for (let i = 0; i < this.plants.length; i ++) {
      let currPlant = this.plants[i];
      let pos2Plant = currPlant.pos2Plant(x, y, d, this.speed);
      if (pos2Plant == 0) {
        // plant takes damage
        currPlant.damage(magnitude);
        if (currPlant.isDead()) {
          currDead.push(i);
        }
      } else if (pos2Plant < 0) {
        // past the plant --> no need to check more
        break;
      }
    }
    
    for (let i = currDead.length - 1; i >= 0; i--) {
      this.plants.splice(currDead[i], 1);
    }
  }
  
  update() {
    // console.log(this.stopPoint);
    for (let i = 0; i < this.plants.length; i ++) {
      this.plants[i].update();
    }
  }
  
  numPlantsAtStopPoint() {
    let count = 0;
    for (let i = 0; i < this.plants.length; i++) {
      if (this.plants[i].x == this.stopPoint) {
        count += 1;
      }
    }
    return count;
  }
  
  getRowSize() {
    return windowHeight / _numRows;
  }
  
  draw() {
    // noFill();
    // stroke(255, 0, 0, 80);
    // push();
    // if (this.index % 2 === 0) {
    //   fill("#62B46A");
    // } else {
    //   fill("#72CA76");
    // }
    // noStroke();
    // rect(0, this.y - this.d / 2, width, this.d);
    // pop();
    
    for (let i = 0; i < this.plants.length; i ++) {
      this.plants[i].draw();
    }
  }
}