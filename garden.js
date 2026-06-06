class Garden {
  constructor(numPlants, imageMap, spacing, startY) {
    this.images = imageMap;
    this.plants = new Array(numPlants);
    this.numAlive = numPlants;
    
    let nativeKeys = Object.keys(nativeImgs);
    for (let i = 0; i < numPlants; i++) {
      let imgs = imageMap[nativeKeys[i % nativeKeys.length]];
      this.plants[i] = (new NativePlant(width / 2, (i * spacing) + startY + _diameter/2, _diameter, imgs));
    }
  }
  
  damage(rowIdx, magnitude) {
    if (this.plants[rowIdx]) {
      this.plants[rowIdx].damage(magnitude);
      if (this.plants[rowIdx].isDead()) {
        this.plants[rowIdx] = null;
      }
    }
  }
  
  getHealth() {
    let total = 0;
    for (const plant of this.plants) {
      if (plant) total += plant.health;
    }
    return total;
  }
  
  draw() {
    for (const plant of this.plants) {
      if (plant) {
        plant.update();
        plant.draw();
      }
    }
  }
  
}