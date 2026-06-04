class Plant {
  constructor(x, y, d, stop) {
    this.health = 100;
    this.x = x;
    this.y = y;
    this.d = d;
  }
  
  update(speed, stopPoint) {
    // pipes always go from right to left
    if ((this.x != stopPoint) && 
        (this.x - stopPoint > 0) == 
        ((this.x + speed) - stopPoint > 0)) {
      this.x += speed; 
    } else {
      this.x = stopPoint;
    }
  }
  
  atX(x) {
    return this.x == x;
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
  
  damage(magnitude) {
    this.health -= magnitude;
  }
  
  isDead() {
    return this.health <= 0;
  }
  
  draw() {
    fill(0);
    circle(this.x, this.y, this.d);
  }
  
  customDraw(color) {
    fill(color);
    circle(this.x, this.y, this.d);
  }
}

class PlantRow {
  constructor(y, diameter, isRight, stopPoint) {
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
    
  }
  
  addPlant() {
    this.plants.push(new Plant(this.xStart, this.y, this.d));
  }
  
  shearsCut(x, y, d, magnitude) {
    let currDead = [];
    // for each plant -> check if it touches the shears
    for (let i = 0; i < this.plants.length; i ++) {
      let currPlant = this.plants[i];
      let shearsPos2Plant = currPlant.pos2Plant(x, y, d, this.speed);
      if (shearsPos2Plant == 0) {
        // plant takes damage
        currPlant.damage(magnitude);
        if (currPlant.isDead()) {
          currDead.push(i);
        }
      } else if (shearsPos2Plant < 0) {
        // past the plant --> no need to check more
        break;
      }
    }
    
    for (let i = 0; i < currDead.length; i++) {
      this.plants.splice(i, 1);
    }
  }
  
  update() {
    // console.log(this.stopPoint);
    for (let i = 0; i < this.plants.length; i ++) {
      if (!this.plants[i].atX(this.stopPoint)) {
        this.plants[i].update(this.speed, this.stopPoint);
      }
    }
  }
  
  numPlantsAtStopPoint() {
    let count = 0;
    for (let i = 0; i < this.plants.length; i++) {
      if (this.plants[i].atX(this.stopPoint)) {
        count += 1;
      }
    }
    return count;
  }
  
  draw() {
    for (let i = 0; i < this.plants.length; i ++) {
      this.plants[i].draw();
    }
  }
}