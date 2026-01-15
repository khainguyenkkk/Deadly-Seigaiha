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


  drawUI();
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

// --- UI CONFIGURATION ---
let isMuted = false;        // Trạng thái âm thanh
const btnSize = 40;         // Kích thước nút
const btnY = 20;            // Vị trí Y (cách lề trên)
const btnSoundX = 20;       // Vị trí X nút Loa
const btnInfoX = 70;        // Vị trí X nút Info

// Biến âm thanh cho nút (nếu có)
// let buttonSound;


function drawUI() {
  push(); // Cô lập style để không ảnh hưởng bài chính
  noStroke();

  // --- VẼ NÚT SOUND ---
  let isHoverSound =
    mouseX > btnSoundX &&
    mouseX < btnSoundX + btnSize &&
    mouseY > btnY &&
    mouseY < btnY + btnSize;
    
  // Nền nút
  fill(isHoverSound ? 80 : 40, 200);
  rect(btnSoundX, btnY, btnSize, btnSize, 8);
  
  // Icon Loa / Mute
  fill(255);
  if (isMuted) {
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(NORMAL);
    text("MUTE", btnSoundX + btnSize / 2, btnY + btnSize / 2);
    stroke(255, 0, 0);
    strokeWeight(2);
    line(btnSoundX + 5, btnY + 5, btnSoundX + btnSize - 5, btnY + btnSize - 5);
  } else {
    noStroke();
    beginShape();
    vertex(btnSoundX + 10, btnY + 14);
    vertex(btnSoundX + 18, btnY + 14);
    vertex(btnSoundX + 28, btnY + 8);
    vertex(btnSoundX + 28, btnY + 32);
    vertex(btnSoundX + 18, btnY + 26);
    vertex(btnSoundX + 10, btnY + 26);
    endShape(CLOSE);
  }

  // --- VẼ NÚT INFO ---
  noStroke();
  let isHoverInfo =
    mouseX > btnInfoX &&
    mouseX < btnInfoX + btnSize &&
    mouseY > btnY &&
    mouseY < btnY + btnSize;
  
  // Nền nút
  fill(isHoverInfo ? 80 : 40, 200);
  rect(btnInfoX, btnY, btnSize, btnSize, 8);
  
  // Chữ "i"
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text("i", btnInfoX + btnSize / 2, btnY + btnSize / 2);

  // Tooltip (Hiện bảng hướng dẫn khi rê chuột vào)
  if (isHoverInfo) {
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY + 15;
    // Chặn tooltip tràn ra ngoài màn hình
    if (tooltipX + 220 > width) tooltipX = width - 230;
    
    // Khung tooltip
    fill(20, 240);
    stroke(255, 100);
    strokeWeight(1);
    rect(tooltipX, tooltipY, 220, 90, 5);
    
    // Nội dung text
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(NORMAL);
    text("GUIDELINE:", tooltipX + 10, tooltipY + 10);
    
    textSize(11);
    fill(200);
    textLeading(18);
    text(
      "- Click & Hold: Create protection bubble\n- Click red Seigaiha: Destruction sound\n- Click white Seigaiha: Healing sound",
      tooltipX + 10,
      tooltipY + 30
    );
  }
  pop();
}


