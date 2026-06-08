#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL343.h>
#include <Servo.h>

Adafruit_ADXL343 accel = Adafruit_ADXL343(12345);

// species selection buttons
const int BUTTON_1 = 4;
const int BUTTON_2 = 5;
const int BUTTON_3 = 6;

const char* species[3] = {"salal", "dogwood", "camas"};

// planting button
const int PLANT_BUTTON = 7;

// servo for opening and closing device
const int SERVO_PIN = 13;

// The shake threshold in m/s^2. 
// Adjust this value: 15-20 for light shakes, 30+ for aggressive shakes.
// citation: AI Overview
const float SHAKE_THRESHOLD = 25.0; 

Servo myServo;
int species_selected = -1;
bool can_plant = false;

void setup(void)
{
  Serial.begin(115200);
  while (!Serial);

  /* Initialise the sensor */
  if(!accel.begin())
  {
    /* There was a problem detecting the ADXL343 ... check your connections */
    Serial.println("Ooops, no ADXL343 detected ... Check your wiring!");
    while(1);
  }

  /* Set the range to whatever is appropriate for your project */
  accel.setRange(ADXL343_RANGE_16_G);

  /* servo set up */
  myServo.attach(SERVO_PIN);

  /* set up buttons */
  pinMode(BUTTON_1, INPUT_PULLUP);
  pinMode(BUTTON_2, INPUT_PULLUP);
  pinMode(BUTTON_3, INPUT_PULLUP);
  pinMode(PLANT_BUTTON, INPUT_PULLUP);

  species_selected = -1;
  close();
}

void loop(void)
{
  if (!can_plant) {
    if (!digitalRead(BUTTON_1) && species_selected != 0) {
      species_selected = 0;
      Serial.println(species[species_selected]);
    } else if (!digitalRead(BUTTON_2) && species_selected != 1) {
      species_selected = 1;
      Serial.println(species[species_selected]);
    } else if (!digitalRead(BUTTON_3) && species_selected != 2) {
      species_selected = 2;
      Serial.println(species[species_selected]);
    }
  }
  
  if (!can_plant && species_selected != -1 && !digitalRead(PLANT_BUTTON)) {
    can_plant = true;
    open();
    checkShake();
  } else if (can_plant) {
    checkShake();
  }

  delay(100); // Small delay to keep readings manageable
}

bool checkShake() {
  if (species_selected != -1) {
    sensors_event_t event;
    accel.getEvent(&event);

    // Calculate the magnitude of acceleration in 3D: sqrt(x^2 + y^2 + z^2)
    float x = event.acceleration.x;
    float y = event.acceleration.y;
    float z = event.acceleration.z;
    
    float totalAcceleration = sqrt(sq(x) + sq(y) + sq(z));

    // Check if the total acceleration exceeds our shake threshold
    if (totalAcceleration > SHAKE_THRESHOLD) {
      Serial.println("plant");
      species_selected = -1;
      can_plant = false;
      close();
    }
  }
}

void open() {
  for (int angle = 0; angle <= 90; angle++) {
    myServo.write(angle);
    delay(15);  // Wait for the servo to reach the position
  }
}

void close() {
  for (int angle = 90; angle >= 0; angle--) {
    myServo.write(angle);
    delay(15);  // Wait for the servo to reach the position
  }
}