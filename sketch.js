/* 
TODOs: 
- make global variables that are constant actually into constants
    *consider creating a file to hold all the constants
- make multiple waves
- implements different game phases (game start, pause, over)

*/

// prevent elements from being on the edge of the screen
let _screenPadding = 10;
let _landStart = 100;

// serial
let serialOptions = { baudRate: 115200  };
let serial;

// general purpose values -> these can become part of
// object state so that different objects have custom
// diameter, damge, etc values
let _diameter = 40;
let damage = 50;

// game play parameters
let _numRows = 5;

// game state
const GAME_MENU = 0;
const GAME_PLAY_PLANTING = 1
const GAME_PLAY_INVASION = 2;
const GAME_PAUSE = 3;
const GAME_OVER = 4;

let _gameState = GAME_MENU;

// game progress
let wave = 3;

// invasive plant state
let _invasiveR;
let _invasiveL;
let _tutorialR;
let _tutorialL;

// native plant state
let garden;

// attack timer
let prevAttackTime = 0;
const attackTimerLength = 500;  // 1 second

// wave timer
let prevWaveTime = 0;
const waveTimerLength = 5000;

// game play timer
let gamePlayTime = 0;
const gamePlayLength = 2 * 60000; // max 2 min play time

// AI controller
let handPose;
let video;
let hands = [];

// players (represented as shears)
let _shearsR;
let _shearsL;

// let osc;
let cutSound;

let clouds = [];

let shearsImg;
let shearsClosedImg;
let invasiveImgs = {};
let nativeImgs = {};

let bushes = [];

function preload() {
  cutSound = loadSound('sounds/cut.mp3');
  invasiveImgs['blackberry'] =
    [loadImage('images/Invasive_Blackberry.png'), 
     loadImage('images/Invasive_Blackberry2.png')
    ];
  invasiveImgs['iris'] = [
    loadImage('images/Invasive_Iris.png'),
    loadImage('images/Invasive_Iris2.png')
  ];
  invasiveImgs['loosestrife'] = [
    loadImage('images/Invasive_Loosestrife.png'),
    loadImage('images/Invasive_Loosestrife2.png')
  ];
  
  nativeImgs['salal'] = [
    loadImage('images/Native_Salal.png'),
    loadImage('images/Native_Salal2.png')
  ];
  nativeImgs['dogwood'] = [
    loadImage('images/Native_Dogwood.png'),
    loadImage('images/Native_Dogwood2.png')
  ];
  nativeImgs['camas'] = [
    loadImage('images/Native_Camas.png'),
    loadImage('images/Native_Camas2.png')
  ];

  bushes.push(loadImage('images/Bush.svg'));
  bushes.push(loadImage('images/Bush2.svg'));

  shearsImg = loadImage('images/ShearsOpen.png');
  shearsClosedImg = loadImage('images/ShearsClosed.png');
  
  // Load the handPose model
  handPose = ml5.handPose({ flipped: true }); // {maxHands: 4}
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  let spacing = getSpacing();
  _diameter = getSpacing();

  createShears();
  createClouds();

  setupGameStart();

  osc = new p5.Oscillator('sine');
  setupSerial();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (video) {
    video.size(windowWidth, windowHeight);
  }
  rebuildLayout();
}

function rebuildLayout() {
  let spacing = getSpacing();
  _diameter = spacing; // your existing logic

  _invasiveR = new InvasiveRowManager(_numRows, spacing, _landStart, true, _diameter);
  _invasiveL = new InvasiveRowManager(_numRows, spacing, _landStart, false, _diameter);
  garden     = new Garden(_numRows, nativeImgs, spacing, _landStart);
  createShears();
}

function getSpacing() {
  return (height - _screenPadding - _landStart) / _numRows;
}

function draw() {
  // background("#72CA76");
  push();
  noStroke();
  fill("#6CC4FF");
  rect(0, 0, width, _landStart);
  drawClouds();

  noTint();
  stroke("#5AA553");
  strokeWeight(10);
  fill("#84C25A");
  let hillRise = _landStart * 0.1;
  beginShape();
  vertex(0, height);
  vertex(0, _landStart);
  bezierVertex(width * 0.25, _landStart - hillRise, width * 0.75, _landStart - hillRise, width, _landStart);
  vertex(width, height);
  endShape(CLOSE);
  pop();
  
  if (_gameState == GAME_MENU) {
    gameMenu();
  } else if (_gameState == GAME_PLAY_PLANTING) {
    gamePlayPlanting();
  } else if (_gameState == GAME_PLAY_INVASION) {
    gamePlay();
  } else if (_gameState == GAME_PAUSE) {
    gamePause();
  } else if (_gameState == GAME_OVER) {
    gameOver();
  }

  let i = floor(frameCount / 20) % bushes.length;
  image(bushes[i], 0, _landStart/1.2, bushes[i].width / 2.4, bushes[i].height / 2.4);
  scale(-1, 1);
  image(bushes[i], -width, _landStart/1.2, bushes[i].width / 2.4, bushes[i].height / 2.4);
  scale(-1, 1);

  updateShears();
  drawShears();
}

function setupGameStart() {
  console.log(`setting up game start!`);
  _gameState = GAME_MENU;

  // add invasive plant to left and right side
  _tutorialR = new Plant(3 * width/ 4, height * 0.75, _diameter, _shearsR.power * 3, invasiveImgs['blackberry']);
  _tutorialL = new Plant(width/ 4, height * 0.75, _diameter, _shearsR.power * 3, invasiveImgs['blackberry'])
}

function gameMenu() {
  fill(0);
  textAlign(CENTER);
  textSize(40);
  text(`Cut down the invasive\nplants to start!`, width / 2, height/3);
  if (!_tutorialL.isDead()) {
    _tutorialL.update();
    _tutorialL.draw();
  }
  if (!_tutorialR.isDead()) {
    _tutorialR.update();
    _tutorialR.draw();
  }
}

function gamePlaySetup() {
  console.log(`setting up game play...`)
  _gameState = GAME_PLAY_PLANTING;
  // game play setup
  let spacing = getSpacing();
  garden = new Garden(_numRows, nativeImgs, spacing, _landStart);
  _invasiveR = new InvasiveRowManager(_numRows, spacing, _landStart, -1, _diameter);
  _invasiveL = new InvasiveRowManager(_numRows, spacing, _landStart, 1, _diameter);

  // reset timers
  let prevAttackTime = 0;
  let prevWaveTime = 0;

  // reset wave
  wave = 3;

  gamePlayTime = millis();
}

function gamePlayPlanting() {
  garden.draw();
  drawScore();
}

function gamePlay() {
  // Draw the webcam video
  // image(video, 0, 0, width, height);
  console.log(`here!`)
  if (_invasiveR.timeSinceWaveEnd() > waveTimerLength) {
    console.log(`wave ${wave}`)
    _invasiveR.generateWave(wave);
    _invasiveL.generateWave(wave);
    
    wave += 1;
    prevWaveTime = millis();
  }
  
  _invasiveR.update();
  _invasiveR.draw();
  _invasiveL.update();
  _invasiveL.draw();

  if (millis() - prevAttackTime > attackTimerLength) {
    for (let i = 0; i < _numRows; i ++) {
      let numAttacks = _invasiveR.rows[i].numPlantsAtStopPoint() + _invasiveL.rows[i].numPlantsAtStopPoint();
      garden.damage(i, numAttacks * 30); // TODO magic number
    }
    
    // reset timer
    prevAttackTime = millis();
  }
  
  garden.draw();
  drawScore();
  
  if (garden.getHealth() == 0 || millis() - gamePlayTime > gamePlayLength) {
    _gameState = GAME_OVER;
  }
}

function gamePause() {
  fill(0);
  textAlign(CENTER);
  textSize(40);
  text(`Press space to continue game`, width / 2, height/2);
}

function gameOver() {
  fill(0);
  textAlign(CENTER);
  textSize(30);
  score = garden.getHealth();
  if (score == 0) {
    text(`GAME OVER\ncut anywhere to try again`, width / 2, height / 2);
  } else {
    text(`Your garden survives!\nscore: ${score}\nut anywhere to try again`, width / 2, height/2);
  }
}

function createShears() {
  _shearsL = new Shears(0, width / 2, _diameter, damage);
  _shearsR = new Shears(width / 2, width, _diameter, damage);
}


function drawScore() {
  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(30);
  text(`score: ${garden.getHealth()}`, width / 2, 10);
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
function shearsCut(shears, invasives) {
  if (_gameState == GAME_PLAY_INVASION) {
    for (const rowIdx of getNearbyRowIdx(shears.y)) {
      invasives.rows[rowIdx].damage(shears.x, shears.y, shears.d, shears.power);
    }
  } else if (_gameState == GAME_MENU) {
    let plant = _tutorialL;
    if (shears.x > width / 2) {
      plant = _tutorialR;
    }
    
    if (plant.pos2Plant(shears.x, shears.y, shears.d, 0) == 0) {
      plant.damage(shears.power);
      if (_tutorialL.isDead() && _tutorialR.isDead()) {
        gamePlaySetup();
      }
    }
  } else if (_gameState == GAME_OVER) {
    setupGameStart();
  }
}

function plant(plantName) {
  if (_gameState == GAME_PLAY_PLANTING) {
    garden.plant(plantName);
    if (garden.currPlantingRow == _numRows) {
      _gameState = GAME_PLAY_INVASION;
    }
  }
}

function getRowIdx(y) {
  return Math.round((y - _landStart - _diameter/2) / getSpacing());
}

function getNearbyRowIdx(y) {
  // find the closest rows
  let spacing = getSpacing();
  let roundUp = ceil((y - _landStart - _diameter/2) / spacing);
  let roundDown = floor((y - _landStart - _diameter/2) / spacing);
    
  let result = [];
  // inform both rows of cut
  if (roundUp < _numRows && roundUp >= 0) {
    result.push(roundUp);
  }
  if (roundDown < _numRows && roundDown >= 0) {
    result.push(roundDown);
  }
  return result;
}

function gotHands(results) {
  hands = results;
}

function keyPressed() {
  if (key === ' ') {
    if (_gameState == GAME_PLAY_INVASION) {
      _gameState = GAME_PAUSE;
    } else if (_gameState == GAME_PAUSE) {
      _gameState = GAME_PLAY_INVASION;
    }
  } else if (key === 's') {
    if (!serial.isOpen()) {
      serial.connectAndOpen(null, serialOptions);
    }
  } else if (key === 'p') {
    plant('salal');
  }
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  // if (!bleDevice || !bleDevice.gatt.connected) {
  //   connectBLE();
  // } 
  // else {
  //   _shearsL.setCut();
  //   shearsCut(_shearsL, _invasiveL);
  //   playCutSound();
  // }
  
  _shearsL.setCut();
  shearsCut(_shearsL, _invasiveL);
  _shearsR.setCut();
  shearsCut(_shearsR, _invasiveR);
  playCutSound();
}
  
function onBLEMessage(value) {
  let msg = value.trim();
  // // console.log(msg);
  if(msg === "Cut") {
    _shearsR.setCut();
    shearsCut(_shearsR, _invasiveR);
    playCutSound();
  }
}

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
let bleDevice, txChar;


async function connectBLE() {
  bleDevice = await navigator.bluetooth.requestDevice({
    filters: [{ name: "MyESP32" }],
    optionalServices: [SERVICE_UUID]
  });
  const server  = await bleDevice.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  txChar        = await service.getCharacteristic(TX_UUID);
  await txChar.startNotifications();
  txChar.addEventListener("characteristicvaluechanged", (e) => {
    onBLEMessage(new TextDecoder().decode(e.target.value).trim());
  });
}

function playCutSound() {
  // osc.start();
  // osc.freq(800);
  // osc.amp(0.5, 0.01);
  // osc.amp(0, 0.1, 0.05);

  cutSound.play(0, 1, 1, 1.5, 1);
}

function createClouds() {
  clouds = [];
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: random(width),
      y: random(_landStart * 0.1, _landStart * 0.75),
      speed: random(0.2, 0.6),
      size: random(60, 130),
    });
  }
}

function drawClouds() {
  noStroke();
  fill(255, 255, 255, 200);
  for (let c of clouds) {
    c.x += c.speed;
    if (c.x - c.size > width) c.x = -c.size;

    let s = c.size;
    ellipse(c.x,        c.y,        s * 1.6, s * 0.9);
    ellipse(c.x - s * 0.45, c.y + s * 0.1, s * 1.0, s * 0.8);
    ellipse(c.x + s * 0.45, c.y + s * 0.1, s * 1.1, s * 0.75);
    ellipse(c.x - s * 0.15, c.y - s * 0.3, s * 0.9, s * 0.7);
    ellipse(c.x + s * 0.2,  c.y - s * 0.2, s * 0.8, s * 0.65);
  }
}

// serial functions
function setupSerial() {
  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);
}

async function serialWrite() {
  if (serial.isOpen()) {
    // Write out the data to serial
    // serial.writeLine();
  }
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  
  if (!newData.startsWith("#")) {
      plant(newData);
  }
}
