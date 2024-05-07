//Simple Gears(visual simulation test code).
//Built with Processing 2.03 by Adrian Fernandez. Miami, FL. USA. (07-31-2014).

minNumberOfTeeth=8;
maxNumberOfTeeth=80;
theta = 0;
FPS = 60


function setup()
{
  createCanvas(1350, 690);  
  frameRate(FPS);
  textAlign(CENTER);
  textSize(18);
  // Sliders
  createP("Degrees per frame (ideal)");
  dpsSlider = createSlider(0.1, 3.0, 0.5, 0.1);
}


function draw()
{
  dps = dpsSlider.elt.value;
  background(0);  
  teethAmount = 8;
  radio1=teethAmount*5;
  teethHeight=0.18*60; 
  centerPositionX=width/3;
  centerPositionY=height/2;
  rotationDirection=1;
  rotationSpeed=1;
  drawGear(radio1, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps);
  
  let rpm1 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(LEFT);
  text(`RPM1: ${round(rpm1, 2)}`, 0, height - 3);
  
  teethAmount = 20;
  radio2=teethAmount*5;  
  rotationDirection=-1;
  rotationSpeed=radio1/radio2;
  centerPositionX=1*width/3+radio2+teethHeight+radio1;
  centerPositionY=height/2; 
  drawGear(radio2, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps); 
  
  let rpm2 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(CENTER);
  text(`RPM2: ${round(rpm2, 2)}`, width/2, height - 3);
  
  teethAmount = 70
  radio3=teethAmount*5;
  rotationDirection=1;
  rotationSpeed=radio1/radio3;
  centerPositionX=1*width/3+radio3+teethHeight*2+radio1+radio2*2;
  centerPositionY=height/2; 
  drawGear(radio3, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed*theta, dps); 
  fill(255);
  theta += 0.1
  
  let rpm3 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
  textSize(24);
  textAlign(RIGHT);
  text(`RPM3: ${round(rpm3, 2)}`, width-150, height - 3);
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
