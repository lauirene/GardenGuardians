class Shears {
  constructor(minX, maxX, d) {
    this.minX = minX;
    this.maxX = maxX;
    this.x = minX;
    this.y = 0;
    this.d = d;
    this.cut = 0;
    this.cutLength = 100;
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
    this.cut = millis();
  }
  
  cutApplied() {
    this.cut = 0;
  }
  
  isCutting() {
    return this.cut > 0 && (millis() - this.cut) < this.cutLength;
  }
  
  draw() {
    fill(0, 100, 0);
    circle(this.x, this.y, this.d);
  }
}