function buildArray(n, fn) {
  let arr = [];
  for (let i = 0; i < n; i++) arr.push(fn(i));
  return arr;
}


// SOUNDS

let sound1, sound2, sound3, sound4, sound5,
    sound6, sound7, sound8, sound9, sound10;

let ambienceStarted = false;


// CLUSTERS

let clusters = [];
let num = 10;


// CENTER GRAPHIC

let centerLines = [];

// MOUSE BUBBLE

let mouseBubbleR = 0;
let mouseBubbleActive = false;


// PRELOAD

function preload() {
  sound1  = loadSound("codesound/DeepOceanAmbience.wav");
  sound2  = loadSound("codesound/OceanProctection-1.wav");
  sound3  = loadSound("codesound/OceanProctection-2.wav");
  sound4  = loadSound("codesound/HumanDestruction-1.wav");
  sound5  = loadSound("codesound/HumanDestruction-2.wav");
  sound6  = loadSound("codesound/BubbleDestroy-1.wav");
  sound7  = loadSound("codesound/BubbleDestroy-2.wav");
  sound8  = loadSound("codesound/SurfaceOceanAmbience.wav");
  sound9  = loadSound("codesound/Swoosh-1.wav");
  sound10 = loadSound("codesound/Swoosh-2.wav");
}


// SETUP

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("canvas-section");

  clusters = buildArray(num, () =>
    new CircleCluster(width / 2, height / 2, 40, 220)
  );

  centerLines = buildArray(24, (i) => ({
    angle: map(i, 0, 24, 0, TWO_PI),
    length: i % 2 === 0 ? 120 : 220
  }));
}


// DRAW

function draw() {
  background(0, 80);

  let target = mouseBubbleActive ? 180 : 0;
  mouseBubbleR = lerp(mouseBubbleR, target, 0.08);

  if (mouseBubbleR > 5) {
    noFill();
    stroke(255);
    circle(mouseX, mouseY, mouseBubbleR * 2);
  }

  drawCenterGraphic();

  clusters.forEach(c => {
    c.cx = width / 2;
    c.cy = height / 2;
    c.update();
    c.drawPath();
    c.drawCluster();
  });
}


// INPUT

function mousePressed() {
  mouseBubbleActive = true;

  // stop ambience
  if (sound1.isPlaying()) sound1.stop();

  // mouse hold sound
  if (!sound8.isPlaying()) sound8.loop();

  let hit = false;

  clusters.forEach(c => {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.r) {
      hit = true;

      // white cluster
      if (green(c.col) > 180) {
        random() < 0.5 ? sound2.play() : sound3.play();
      }
      // red cluster
      else {
        random() < 0.5 ? sound4.play() : sound5.play();
      }
    }
  });

  // clicked nothing
  if (!hit) {
    random() < 0.5 ? sound9.play() : sound10.play();
  }

  // start ambience once
  if (!ambienceStarted) {
    sound1.loop();
    ambienceStarted = true;
  }
}

function mouseReleased() {
  mouseBubbleActive = false;
  sound8.stop();
  sound1.loop();
}


// CENTER

function drawCenterGraphic() {
  let cx = width / 2;
  let cy = height / 2;

  stroke(255, 50);
  strokeWeight(4);
  noFill();
  circle(cx, cy, 180);

  centerLines.forEach(l => {
    let x1 = cx + cos(l.angle) * 100;
    let y1 = cy + sin(l.angle) * 100;
    let x2 = cx + cos(l.angle) * (350 + l.length);
    let y2 = cy + sin(l.angle) * (350 + l.length);
    line(x1, y1, x2, y2);
  });
}


// CLUSTER CLASS

class CircleCluster {
  constructor(cx, cy, minR, maxR) {
    this.cx = cx;
    this.cy = cy;
    this.minR = minR;
    this.maxR = maxR;

    this.orbitRadius = random(150, 350);
    this.angle = random(TWO_PI);
    this.angleSpeed = random(0.005, 0.01);

    this.growSpeed = random(0.2, 0.5);
    this.noiseSpeed = random(0.01, 0.08);

    this.reset();
  }

  reset() {
    this.angle = random(TWO_PI);
    this.orbitRadius = random(150, 350);
    this.r = this.minR;
    this.col = color(255);
    this.path = [];

    // reset sound
    random() < 0.5 ? sound6.play() : sound7.play();
  }

  update() {
    this.r += this.growSpeed;
    this.angle += this.angleSpeed;

    this.x = this.cx + cos(this.angle) * this.orbitRadius;
    this.y = this.cy + sin(this.angle) * this.orbitRadius;

    let inside = dist(this.x, this.y, mouseX, mouseY) < mouseBubbleR;

    if (this.r > this.maxR * 0.7) {
      if (inside) {
        this.col = color(255);
        this.r -= this.growSpeed;
      } else {
        this.col = color(220, 30, 40);
        this.path.push({ x: this.x, y: this.y });
        if (this.path.length > 300) this.path.shift();
      }
    }

    if (this.r > this.maxR) this.reset();
  }

  drawPath() {
    if (this.path.length < 5) return;
    stroke(220, 30, 40);
    strokeWeight(this.growSpeed * 8);
    noFill();
    beginShape();
    this.path.forEach(p => vertex(p.x, p.y));
    endShape();
  }

  drawCluster() {
    noFill();
    stroke(this.col);

    for (let n = 0; n < 4; n++) {
      let wig = noise(frameCount * this.noiseSpeed) * 5;
      strokeWeight(3);
      ellipse(this.x, this.y, this.r - n * 40 + wig, this.r - n * 40 + wig);
    }
  }
}


