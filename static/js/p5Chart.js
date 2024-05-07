//Simple Gears(visual simulation test code).
//Built with Processing 2.03 by Adrian Fernandez. Miami, FL. USA. (07-31-2014).

minNumberOfTeeth=6;
maxNumberOfTeeth=100;
theta = 0;
FPS = 60
rpmIn = 5000

x1 = 100;
y1 = 0;
x2 = 200;
y2 = 0;
angle = 0;
len=300
speed = 0.01;
distance = 100

function findRatio(fps){
  rpm = 60*Math.floor(fps);
  return rpm
}

function findFPS(mass, area, swipe){
  fps = 4* sqrt(mass/area)/(swipe*swipe)
  return fps
}

function calcGearRatio(inRPM, outRPM){
  let firstGear = 0;
  let lastGear = 0;
  //lastGear = firstGear/(outRPM/inRPM)
  for(firstGear=6; firstGear<30; firstGear++){
    for(lastGear=1; lastGear<100; lastGear++) {
     if((firstGear/lastGear) == (outRPM/inRPM)){
        break
      }
    }
    if((firstGear/lastGear) == (outRPM/inRPM)){
      break
    }
  }
  return [firstGear, lastGear]
}

function setup()
{
  createCanvas(window.innerWidth / 2, window.innerHeight / 2, document.getElementById("gears"));  
  frameRate(FPS);
  textAlign(CENTER);
  textSize(18);
  //Wing
  origin = createVector(width/2,3*height/4)
  rightWing = createVector(0, 0)
  leftWing = createVector(0, 0)
  // Sliders
  // createP("RPM on first gear");
  // dpsSlider = createSlider(1, 30.0, 0.5, 0.1);
}


function draw()
{
  clear()
  rpmOut = findRatio(findFPS(160,4,1))
  let [firstRate, lastRate] = calcGearRatio(rpmIn,rpmOut);
  // dps = dpsSlider.elt.value;
  dps = 1
  background('rgba(0,0,0,0)');  
  teethAmount = firstRate;
  radio1=teethAmount*5;
  teethHeight=0.18*60; 
  centerPositionX=width/3;
  centerPositionY=height/3;
  rotationDirection=1;
  rotationSpeed=1;
  drawGear(radio1, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps);
  
  let rpm1 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(LEFT);
  text(`RPM1: ${round(rpm1, 2)}`, 0, height - 3);
  text(`Gear Ratio: ${[firstRate, lastRate]}`,50,50)
  
  teethAmount = Math.floor((firstRate+lastRate)/2);
  radio2=teethAmount*5;  
  rotationDirection=-1;
  rotationSpeed=radio1/radio2;
  centerPositionX=centerPositionX+radio2+teethHeight+radio1;
  drawGear(radio2, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps); 
  
  let rpm2 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(CENTER);
  text(`RPM2: ${round(rpm2, 2)}`, width/2, height - 3);
  
  teethAmount = lastRate
  radio3=teethAmount*5;
  rotationDirection=1;
  rotationSpeed=radio1/radio3;
  centerPositionX=centerPositionX+radio3+teethHeight+radio2;
  drawGear(radio3, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps); 
  theta += 0.1
  
  let rpm3 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(RIGHT);
  text(`RPM3: ${round(rpm3, 2)}`, width-10, height - 3);
  
  rightWing.x = origin.x + len*cos(angle)
  rightWing.y = origin.y + len*sin(angle)
  leftWing.x = origin.x - len*cos(-angle)
  leftWing.y = origin.y - len*sin(-angle)
  
  fill(0);
  strokeWeight(3)
  ellipse(origin.x,origin.y,20,20);
  strokeWeight(5);
  line(origin.x,origin.y,rightWing.x,rightWing.y)
  line(origin.x,origin.y,leftWing.x,leftWing.y)
  if(angle > 0.3){
    speed = -0.01;
  }else if(angle < -0.7){
    speed = 0.01;
  }
  angle += rpm3*speed/PI;
  strokeWeight(2)
  line(origin.x-300,origin.y+70,origin.x+300,origin.y+70)
  line(origin.x-300,origin.y+80,origin.x-300,origin.y+60)
  line(origin.x+300,origin.y+80,origin.x+300,origin.y+60)
  textAlign(CENTER)
  textSize(18)
  text(`${distance} cm`,origin.x,origin.y+90)
  
}

function drawGear(radio, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed, dps)
{ 
  rotationAngle=map(mouseX, 0, width, 0, TWO_PI );
  numberOfTeeth=radio/5; 
  numberOfTeeth=constrain(numberOfTeeth, minNumberOfTeeth, maxNumberOfTeeth);
  teethAngle=TWO_PI/numberOfTeeth;
  teethWidth=sin(teethAngle/2)*radio; 
  lineY=cos(teethAngle/2)*radio+teethHeight;
  push();
  translate(centerPositionX, centerPositionY);
  rotate(rotationDirection*rotationSpeed*dps);
  fill(150);
  stroke(255);
  for (let i=0; i<numberOfTeeth; i++)
  {  
    rotate(teethAngle); 
    stroke(200);
    strokeWeight(1);
    triangle(-3*teethWidth/4, -lineY+teethHeight, teethWidth/2, -lineY+teethHeight, -teethWidth/2, -lineY);
    triangle(teethWidth/4, -lineY, -teethWidth/2, -lineY, teethWidth/2, -lineY+teethHeight);
    stroke(150);
    strokeWeight(2);
    line(-teethWidth/2, -lineY, teethWidth/2, -lineY+teethHeight);
  }
  stroke(100);
  ellipse(0, 0, 2*(-lineY+teethHeight), 2*(-lineY+teethHeight)) ;
  stroke(80);
  strokeWeight(radio/2); 
  ellipse(0, 0, radio, radio);
  fill(0);
  noStroke();
  ellipse(0, 0, radio/5, radio/5);//Shaft
  AdditionsBlock(radio);
  pop();
}

function AdditionsBlock(radio)
{
  rectMode(CENTER);
  rect(0, -radio/10, radio/20, -radio/15);
  ellipse(0, 0.85*radio, radio/15, radio/15);//counterWeight
  rotate(PI/20);
  ellipse(0, 0.85*radio, radio/15, radio/15);//counterWeight
  rotate(PI/20);
  ellipse(0, 0.85*radio, radio/15, radio/15);//counterWeight
}

