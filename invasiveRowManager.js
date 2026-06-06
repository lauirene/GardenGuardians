const colSpacing= 2000; //change to column time spacing
const minInvasives = 2;
const maxInvasives = 4;

class InvasiveRowManager {
  constructor(numRows, spacing, startY, isRight, diameter) {
    let stopPoint = width / 2 - diameter/2;
    if (isRight) {
      stopPoint = width / 2 + diameter/2;
    }
    
    this.waveStartTime = 0;
    this.prevColTime = 0;
    this.level = 1;
    this.rows = 
      Array.from({ length: numRows }, (_, index) => 
                 new PlantRow((index * spacing) + startY + _diameter / 2, _diameter, isRight, stopPoint, index));
  }
  
  randomColumn() {
    let numInvasives = floor(random(minInvasives, minInvasives + this.level));

    for (let i = 0; i < numInvasives; i++) {
      // randomly pick a row
      let currRow = floor(random(0, _numRows));
      // add to the row
      this.rows[currRow].addPlant();
    }
  }
  
  generateWave(level) {
    this.waveStartTime = millis();
    this.level = level;
  }
  
  update() {
    for (let i = 0; i < this.rows.length; i ++) {
      this.rows[i].update();
    }
    
    if (millis() - this.prevColTime > colSpacing && 
        millis() - this.waveStartTime < colSpacing * (this.level)) {
      this.prevColTime = millis();
      // send out new wave of invasives
      this.randomColumn();
    }
  }
  
  draw() {
    for (let i = 0; i < this.rows.length; i ++) {
      this.rows[i].draw();
    }
  }
}