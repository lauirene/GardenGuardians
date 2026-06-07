class Garden {
  constructor(numPlants, imageMap, spacing) {
    this.images = imageMap;
    this.plants = new Array(numPlants);

    this.currPlantingRow = 0;
  }

  plant(plantName) {
    if (this.currPlantingRow < this.plants.length) {
      let y = (this.currPlantingRow * getSpacing()) + _landStart + _diameter/2
      this.plants[this.currPlantingRow] = 
        new NativePlant(y, _diameter, nativeImgs[plantName]);
      this.currPlantingRow += 1;
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
    if (_gameState == GAME_PLAY_PLANTING) {
      //// change this to svg for dirt pile/box thingy // TODO
      fill(64,41,5);
      stroke(182,159,102);
      strokeWeight(10);
      let y = (this.currPlantingRow * getSpacing()) + _landStart + _diameter/2;
      circle(width / 2, y, _diameter);
      ////////////////////////////////////////////////////////
    }
    for (const plant of this.plants) {
      if (plant) {
        plant.update();
        plant.draw();
      }
    }
  }
  
}
