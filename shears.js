class Shears {
  constructor(minX, maxX, d, power) {
    this.minX = minX;
    this.maxX = maxX;
    this.x = minX;
    this.y = 0;
    this.d = d;
    this.power = power;
    this.cutLength = 100;
    
    this.cutImgStart = 0;
  }
  
  update(x, y) {
    if (x < this.minX) {
      this.x = this.minX;
    } else if (x > this.maxX) {
      this.x = this.maxX;
    } else {
      this.x = x;
    }
    this.y = y;
  }
  
  setCut() {
    this.cutImgStart = millis();
  }
  
  isCutting() {
    return millis()-this.cutImgStart < this.cutLength;
  }
  
  draw() {
    imageMode(CENTER);
    
    if(this.isCutting()){
      image(shearsClosedImg, this.x, this.y, this.d, this.d);
    } else {
      this.cutImgStart = 0;
      image(shearsImg, this.x, this.y, this.d, this.d);
    }
    
    imageMode(CORNER);
  }
}