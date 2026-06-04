let _diameter = 40;
let _numInvasiveRows = 10;
let _invasiveRowsR = [];
let _invasiveRowsL = [];
let _screenPadding = 30;
let natives = [];
let minInvasives = 2;
let maxInvasives = 4;
let damage = 50;
let waveCoolDown= 3000;
let prevWaveTime = 0;

let handPose;
let video;
let hands = [];

let _shearsR;
let _shearsL;

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({ flipped: true }); // {maxHands: 4}
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  // creating right side
  let spacing = (height - _screenPadding) / _numInvasiveRows;
  for (let i = 0; i < _numInvasiveRows; i ++) {
    let y = (i * spacing) + _screenPadding;
    _invasiveRowsR.push(new PlantRow(y, _diameter, true, (width/2 + _diameter)));
    _invasiveRowsL.push(new PlantRow(y, _diameter, false, (width/2 - _diameter)));
  }
  
  createGarden();
  createShears();
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);
  
  if (millis() - prevWaveTime > waveCoolDown && millis() < waveCoolDown * 4) {
    console.log("here!");
    prevWaveTime = millis();
    // send out new wave of invasives
    generateWave(_invasiveRowsR);
    generateWave(_invasiveRowsL);
  }
  
  background(220, 200);
  updateShears();
  drawShears();
  
  // is cut is happening, apply damage
  applyShearsCut(_shearsR, _invasiveRowsR);
  applyShearsCut(_shearsL, _invasiveRowsL);
  
  for (let i = 0; i < _invasiveRowsR.length; i ++) {
    _invasiveRowsR[i].update();
    _invasiveRowsR[i].draw();
    _invasiveRowsL[i].update();
    _invasiveRowsL[i].draw();
  }
  
  for (let i = 0; i < natives.length; i ++) {
    // apply damage to each plant if the invasive plants
    // are at the stop point
    let numAttacks = _invasiveRowsR[i].numPlantsAtStopPoint() + _invasiveRowsL[i].numPlantsAtStopPoint();
    natives[i].damage(numAttacks * 30);
  }
  
  drawGarden();
}

function createGarden() {
  let numPlants = 10;
  let spacing = (height - _screenPadding) / numPlants;
  for (let i = 0; i < numPlants; i++) {
    natives.push(new Plant(width / 2, (i * spacing) + _screenPadding, _diameter, false));
  }
}

function createShears() {
  _shearsL = new Shears(0, width / 2, _diameter);
  _shearsR = new Shears(width / 2, width, _diameter);
}

function drawGarden() {
  for (let i = 0; i < natives.length; i++) {
    if (!natives[i].isDead()) {
      natives[i].customDraw(100);
    }
  }
}

function generateWave(invasiveRows) {
  numInvasives = floor(random(minInvasives, maxInvasives));
  
  console.log("numInvasives", numInvasives);
  
  for (let i = 0; i < numInvasives; i++) {
    // randomly pick a row
    let currRow = floor(random(0, _numInvasiveRows));
    console.log("adding invasive to row", currRow);
    // add to the row
    invasiveRows[currRow].addPlant();
  }
}

function drawShears() {
  _shearsL.draw();
  _shearsR.draw();
}

function updateShears() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (hand.handedness !== "Left") continue;

    let xs = hand.keypoints.map(kp => kp.x);
    let ys = hand.keypoints.map(kp => kp.y);
    
    let shearsX = (max(xs) + min(xs)) / 2;
    let shearsY = (max(ys) + min(ys)) / 2;
    if (shearsX > width / 2) {
      // these are on the right side
      _shearsR.update(shearsX, shearsY);
    } else {
      // these are on the left side
      _shearsL.update(shearsX, shearsY);
    }
  }
}

// this function only applies damage to touching invasive plants
// if the shear is cutting, otherwise nothing happens
function applyShearsCut(shears, invasiveRows) {
  if (!shears.isCutting()) {
    return
  }
  let affectedRows = getNearbyRowIdx(shears.y);
    
  for (let i = 0; i < affectedRows.length; i ++) {
    invasiveRows[affectedRows[i]].shearsCut(shears.x, shears.y, shears.d, damage);
  }
  shears.cutApplied();
}

function getNearbyRowIdx(y) {
  // find the closest rows
  let spacing = (height - _screenPadding) / _numInvasiveRows;
  let roundUp = ceil((y - _screenPadding) / spacing);
  let roundDown = floor((y - _screenPadding) / spacing);
    
  let result = [];
  // inform both rows of cut
  if (roundUp < _numInvasiveRows) {
    result.push(roundUp);
  }
  if (roundDown >= 0) {
    result.push(roundDown);
  }
  return result;
}

function gotHands(results) {
  hands = results;
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  console.log("mouse CUT");
  _shearsR.setCut();
  _shearsL.setCut();
}