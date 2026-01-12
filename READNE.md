# Sound interaction

- When Seigaiha is destroyed, it makes bubble sound.
- Mouse click on the red Seigaiha, dangerous sound appears.
- Mouse click on the white Seigaiha, healing sound appears.

# Code explanation

## Global variables

```bash
let sound1, sound2, sound3, sound4, sound5;
let ambienceStarted = false;
```
- This declare sounds and make sure it doens't start multiple times.
 
```python
let clusters = [];
let num = 10;
```
- clusters is an array of objects
- Each object is an instance of CircleCluster
- num controls how many clusters exist

```python
let centerLines = [];
```
- Array to build lines for the sun symbol


## Load sounds

```bash
function preload() {
  sound1 = loadSound("codesound/DeepOceanAmbience.wav");
  sound2 = loadSound("codesound/OceanProctection.wav");
  sound3 = loadSound("codesound/HumanDestruction-1.wav");
  sound4 = loadSound("codesound/HumanDestruction-2.wav");
  sound5 = loadSound("codesound/BubbleDestroy.wav");
}
```

## Create circle clusters
```bash
  for (let i = 0; i < num; i++) {
    clusters.push(
      new CircleCluster(width / 2, height / 2, 40, 220)
    );
  }
```
- Create clusters (orbit place x, y, min radius, max radius)



## Create sun symbol
```bash
  let totalLines = 24;

  for (let i = 0; i < totalLines; i++) {
    let angle = map(i, 0, totalLines, 0, TWO_PI);
    let length = i % 2 === 0 ? 120 : 220;

    centerLines.push({
      angle: angle,
      length: length
    });
  }
```
- declare numbers of lines
- Create spacing around circle angle = (i / totalLines) × 2π
- % is modulo operator creates long and short lines in a pattern
- Feed new input in line arrays


## Draw function
```bash
function draw() {
  background(0,80);

  drawCenterGraphic(); 

let cx = width / 2;
let cy = height / 2;

for (let c of clusters) {
  c.cx = cx;
  c.cy = cy;
  c.update();
  c.drawPath();
  c.drawCluster();
}
}
```
- Alpha value to 80 to create motion blur effect
- Draw the sun symbol - centerGraphic everyframe
- Draw cluster in order: update position, movement path, cluster pattern on top

## Mouse interaction
```bash
function mousePressed() {
  if (!ambienceStarted) {
    sound1.loop();
    sound1.setVolume(0.4);
    ambienceStarted = true;
  }

  for (let c of clusters) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.r / 2) {
      if (red(c.col) < 200) {
        sound2.play();
      } else {
        random() < 0.5 ? sound3.play() : sound4.play();
      }
    }
  }
}
```

- Sound start when users press, set ambience volume to 0.4
- Declare variable d for tracking position on mouse
- Play sound 2 when mouse click cluster with red porperties, else play sound 3 and 4 randomly

## Draw sun symbol
```bash
function drawCenterGraphic() {
  let cx = width / 2;
  let cy = height / 2;

  stroke(255,40);
  strokeWeight(4);
  noFill();

  // center circle
  circle(cx, cy, 180);

  // radial lines
  for (let l of centerLines) {
    let x1 = cx + cos(l.angle) * 100;
    let y1 = cy + sin(l.angle) * 100;

    let x2 = cx + cos(l.angle) * (100 + l.length);
    let y2 = cy + sin(l.angle) * (100 + l.length);

    line(x1, y1, x2, y2);
  }
}
```
- Put the circle in the middle of the frame
- Assign stroke color and decrease alpha to make it blends
- Draw circle with radius of 180
- Draw lines from it using Radial line math x = cx + cos(angle) * radius;        
y = cy + sin(angle) * radius

## Draw circle cluster
```bash
class CircleCluster {
  constructor(cx, cy, minR, maxR) {
    this.cx = cx;
    this.cy = cy;
    this.minR = minR;
    this.maxR = maxR;

    this.orbitRadius = random(150, 350);
    this.angle = random(TWO_PI)x1;
    this.angleSpeed = random(0.005, 0.01);

    this.growSpeed = random(0.2, 0.5);
    this.noiseSpeed = random(0.01, 0.08);

    this.r = this.minR;
    this.col = color(150);

    this.x = 0;
    this.y = 0;

    this.path = []; // stores center path when red

    this.reset();
  }
```
- Create constructor with respective properties with class
- Set position and min, max radius
- Circular movement properties: orbit radius (distance from the center), angle (position), angleSpeed
- GrowSpeed and noiseSpeed are for growing and noise animation
- Minimum radius, white color, 0 position when created
- This.path array acts as temporal memory
- This.reset avoids duplicated setup logic


## Reset
```bash
  reset() {
    this.angle = random(TWO_PI);
    this.orbitRadius = random(100, 350);
    this.r = this.minR;
    this.col = color(150);
    this.path = [];

    this.x = this.cx + cos(this.angle) * this.orbitRadius;
    this.y = this.cy + sin(this.angle) * this.orbitRadius;

    if (sound5.isLoaded()) {
      sound5.play();
    }
  }
```
- The circle cluster reset when the cluster reach maximum size
- Randomizes motion → no repetition
- Clears memory → no old trails
- Returns to passive state
- The x - y formulas ensure the cluster appears immediately in a valid orbit position.
- Play sound 5 if reset


## Update
```bash
  update() {
    this.r += this.growSpeed;
    this.angle += this.angleSpeed;

    this.x = this.cx + cos(this.angle) * this.orbitRadius;
    this.y = this.cy + sin(this.angle) * this.orbitRadius;

    // turn red + record path
    if (this.r > this.maxR * 0.7) {
      this.col = color(220, 30, 40);

      this.path.push({ x: this.x, y: this.y });
      if (this.path.length > 300) {
        this.path.shift();
      }
    }

    if (this.r > this.maxR) {
      this.reset();
    }
  }
```
- Linear growth and angle speed for clusters
- Create the core motion formula
- Turn red if they are 70% max radius
- This.path.push records the center point, trail the movement history. Below prevents infinite memory growth
- Clusters reset when reach max radius


## Draw red center path
```bash
  drawPath() {
    if (this.path.length < 5) return;

    stroke(220, 30, 40);
    strokeWeight(this.growSpeed * 8);
    noFill();

    beginShape();
    for (let p of this.path) {
      vertex(p.x, p.y);
    }
    endShape();
  }
```
- Draw path
- The second line prevents from flickering
- Path properties: color, weight, nofill
- Beginshape draws a continuous polyline.


## Draw red center path
```bash
 drawCluster() {
    noFill();
    stroke(this.col);

    for (let n = 0; n < random(2, 5); n++) {
      let wig = noise(frameCount / 50 * this.noiseSpeed) * 4;
      strokeWeight(wig + 2 - n);

      ellipse(
        this.x,
        this.y,
        this.r - n * 40 + wig,
        this.r - n * 40 + wig
      );
    }
  }
```
- Each cluster is made of multiple concentric rings
- Draw ellipse based on available properties

