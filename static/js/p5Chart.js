//Simple Gears(visual simulation test code).
//Built with Processing 2.03 by Adrian Fernandez. Miami, FL. USA. (07-31-2014).
//<reference types="p5" />

// Defining the highest and lowest number of teeth for gears
minNumberOfTeeth = 6;
maxNumberOfTeeth = 200;
theta = 0;
FPS = 60

x1 = 100;
y1 = 0;
x2 = 200;
y2 = 0;
angle = 0;
len = 300
speed = 0.01;

let rpmInput = document.getElementById("rpm-input");
rpmIn = rpmInput.value;

rpmInput.oninput = function () {
    const inputValue = rpmInput.value

    if (rpmIn != inputValue && inputValue !== "") {
        rpmIn = inputValue

    }
}
wingLengthInput.oninput = function () {
    const inputValue = wingLengthInput.value

    if (parameters.wingLength != inputValue && inputValue !== "") {
        parameters.wingLength = inputValue

        updatePoints()
    }
}


kippsInput.oninput = function () {
    const inputValue = kippsInput.value

    if (parameters.kippsDistance != inputValue && inputValue !== "") {
        parameters.kippsDistance = inputValue

        updatePoints();
    }
}


massInput.oninput = function () {
    const inputValue = massInput.value

    if (parameters.mass != inputValue && inputValue !== "") {
        parameters.mass = inputValue

        updatePoints();
    }
}

/**
* Converts from FPS (flaps per seconds) to RPM (rotations per minute)
* @param {Number} fps 
* @return {Number} rpm
*/
function findRatio(fps) {
    rpm = 60 * fps;
    return rpm
}

/**
* Formula to calculate the wing beat frequency
* @param {Number} mass in gram
* @param {Number} wingArea in mm^2
* @param {Number} wingSpan in mm
* @return {Number} fps
*/
function findFPS(mass, wingArea, wingSpan) {
    // converting from units in data to units in formula.
    mass = mass / 1000;
    wingArea = wingArea / 1000000;
    wingSpan = wingSpan / 1000;
    g = 9.81;
    p = 1.225;

    fps = 1.08 * (Math.pow(mass,(1/3))*Math.pow(g,(1/2)))/(wingSpan*Math.pow(wingArea,(1/4))*Math.pow(p,(1/3)))

    return fps
}

/**
* Reducing a number down to the smallest prime factors
* @param {Number} n
* @return {List} factors
*/
function primeFactors(n) {
    const factors = [];
    let divisor = 2;

    while (n >= 2) {
        if (n % divisor == 0) {
            factors.push(divisor);
            n = n / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}

/**
* Checking if a number is a prime number and returning true or false accordingly
* @param {Number} number
* @return {Boolean} bool
*/
function isPrime(number) {
    if (number < 2) {
        return false;
    }

    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return false;
        }
    }

    return true;
}


/**
* Finding the gear ratio for compound gear train set up
* @param {Number} inRPM input RPM of system
* @param {Number} outRPM output RPM of system
* @return {List} gearRatio First the increasing layer, then the decreasing layers.
*/
function findCompoundGear(inRPM, outRPM) {
    if (inRPM % outRPM == 0){
        multiplier = 1;
    }else{
    multiplier = Math.round(outRPM / (inRPM % outRPM));
    }
    devider = Math.round(multiplier * inRPM / outRPM);

    if (isPrime(devider)) {
        return [multiplier, [devider]]
    } else if (Math.sqrt(devider) % 1 == 0) {
        squared = Math.sqrt(devider)
        return [multiplier, [squared, squared]]

    } else {
        return [multiplier, primeFactors(devider)]
    }

    return output
}


/**
* The first function that is ran when running a P5 script
*/
function setup() {
    createCanvas(window.innerWidth / 2, window.innerHeight / 2, document.getElementById("gears"));
    frameRate(FPS);
    textAlign(CENTER);
    textSize(18);
    //Wing
    origin = createVector(width / 2, 3 * height / 4)
    rightWing = createVector(0, 0)
    leftWing = createVector(0, 0)
    // Sliders
    //createP("RPM on first gear");
    //dpsSlider = createSlider(1/(2*PI), 30.0, 10, 1);
}

/**
* Converts from FPS (flaps per seconds) to RPM (rotations per minute)
* @param {Number} rpmIn RPM into the system
* @param {Number} rpmOut Wanted RPM out
* @param {Number} width width of canvas
* @param {Number} height height of canvas
* @param {Number} dps speed of rotation
* @return {Number} RPM of the last gear
*/
function makeAllGears(rpmIn, rpmOut, width, height, dps) {
    output = findCompoundGear(rpmIn, rpmOut)
    scaler = 10
    multiplier = output[0]
    devider = output[1]
    textAlign(LEFT)
    text(`Gear Ratio: ${output}`, 50, 50)
    teethAmount = minNumberOfTeeth * multiplier;
    radio1 = teethAmount * 5;
    teethHeight = 0.18 * 60;
    centerPositionX = width / 6;
    centerPositionY = height / 3;
    rotationDirection = 1;
    rotationSpeed = dps;
    let rpm1 = round(dps * FPS * rotationSpeed * 60 / 360, 2);
    textSize(24);
    textAlign(LEFT);
    text(`RPM1: ${round(rpm1, 2)}`, 0, height - 50);

    
    if(multiplier != 1){
        drawGear(radio1, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed * theta, dps);
    }
    

    teethAmount = minNumberOfTeeth;
    radioPrev = teethAmount * 5;
    rotationDirection = -1;
    rotationSpeed *= radio1 / radioPrev;
    centerPositionX = centerPositionX + radioPrev + teethHeight + radio1;
    drawGear(radioPrev, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed * theta, dps);


    for (i = 0; i < devider.length; i++) {
        teethAmount = minNumberOfTeeth * devider[i];
        radioNew = teethAmount * 5;
        rotationDirection *= -1;
        rotationSpeed *= radioPrev / radioNew;
        centerPositionX = centerPositionX + radioNew + teethHeight + radioPrev;
        drawGear(radioNew, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed * theta, dps);
        if (i == devider.length - 1){
            break
        }
        teethAmount = minNumberOfTeeth;
        radioPrev = teethAmount * 5;
        centerPositionX = centerPositionX;
        drawGear(radioPrev, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed * theta, dps);
    }

    return rotationSpeed;
}

/**
* Converts from FPS (flaps per seconds) to RPM (rotations per minute)
* @param {Number} fps
* @return {Number} rpm
*/
function draw() {
    clear()
    mass = parameters.mass;
    wingspan = parameters.wingLength * 3.16
    wingArea = parameters.wingLength*3.16*(parameters.wingLength - parameters.kippsDistance);
    
    fpsOut = findFPS(mass, wingArea, wingspan)
    rpmOut = findRatio(fpsOut)

    output = findCompoundGear(rpmIn, rpmOut)
    
    dps = document.getElementById("rpm-input").value
    lastRPM = makeAllGears(rpmIn, Math.ceil(rpmOut), width, height, dps);
    
    theta += 0.1
    rightWing.x = origin.x + len * cos(angle)
    rightWing.y = origin.y + len * sin(angle)
    leftWing.x = origin.x - len * cos(-angle)
    leftWing.y = origin.y - len * sin(-angle)

    fill(0);
    strokeWeight(3)
    ellipse(origin.x, origin.y, 20, 20);
    strokeWeight(5);
    line(origin.x, origin.y, rightWing.x, rightWing.y)
    line(origin.x, origin.y, leftWing.x, leftWing.y)
    if (lastRPM != NaN) {
        lastRPM = 1;
    
        if (angle > 0.3) {
            speed = -0.01;
        } else if (angle < -0.7) {
            speed = 0.01;
        }
        angle += lastRPM * speed * PI;
    }
    
    
    textSize(24);
    textAlign(LEFT);
    text(`Last RPM: ${round(lastRPM * dps * PI / 2, 2)}`, 0, height - 3);
    strokeWeight(2)
    line(origin.x - 300, origin.y + 100, origin.x + 300, origin.y + 100)
    line(origin.x - 300, origin.y + 110, origin.x - 300, origin.y + 90)
    line(origin.x + 300, origin.y + 110, origin.x + 300, origin.y + 90)
    textAlign(CENTER)
    textSize(18)
    text(`${Math.round(wingspan/10,2)} cm`, origin.x, origin.y + 120)

}

/**
* Drawing a single gear
* @param {Number} radio Radius of gear
* @param {Number} centerPositionX Center position X-axis
* @param {Number} centerPositionY Center postion Y-axis
* @param {Number} teethHeight Teeth heigh
* @param {Number} rotationDirection Rotational direction of gear
* @param {Number} rotationSpeed Speed of gear
* @param {Number} dps Modifier for gear
*/
function drawGear(radio, centerPositionX, centerPositionY, teethHeight, rotationDirection, rotationSpeed, dps) {
    rotationAngle = map(mouseX, 0, width, 0, TWO_PI);
    numberOfTeeth = radio / 5;
    numberOfTeeth = constrain(numberOfTeeth, minNumberOfTeeth, maxNumberOfTeeth);
    teethAngle = TWO_PI / numberOfTeeth;
    teethWidth = sin(teethAngle / 2) * radio;
    lineY = cos(teethAngle / 2) * radio + teethHeight;
    push();
    translate(centerPositionX, centerPositionY);
    rotate(rotationDirection * rotationSpeed * dps);
    fill(150);
    stroke(255);
    for (let i = 0; i < numberOfTeeth; i++) {
        rotate(teethAngle);
        stroke(200);
        strokeWeight(1);
        triangle(-3 * teethWidth / 4, -lineY + teethHeight, teethWidth / 2, -lineY + teethHeight, -teethWidth / 2, -lineY);
        triangle(teethWidth / 4, -lineY, -teethWidth / 2, -lineY, teethWidth / 2, -lineY + teethHeight);
        stroke(150);
        strokeWeight(2);
        line(-teethWidth / 2, -lineY, teethWidth / 2, -lineY + teethHeight);
    }
    
    stroke(100);
    ellipse(0, 0, 2 * (-lineY + teethHeight), 2 * (-lineY + teethHeight));
    stroke(80);
    strokeWeight(radio / 2);
    ellipse(0, 0, radio, radio);
    fill(0);
    noStroke();
    ellipse(0, 0, radio / 5, radio / 5);//Shaft
    if(numberOfTeeth<15*minNumberOfTeeth){
        AdditionsBlock(radio);
    }
    pop();
}

/**
* Drawing additional feature onto gear
* @param {Number} radio Radius of gear
*/
function AdditionsBlock(radio) {
    rectMode(CENTER);
    rect(0, -radio / 10, radio / 20, -radio / 15);
    ellipse(0, 0.85 * radio, radio / 15, radio / 15);//counterWeight
    rotate(PI / 20);
    ellipse(0, 0.85 * radio, radio / 15, radio / 15);//counterWeight
    rotate(PI / 20);
    ellipse(0, 0.85 * radio, radio / 15, radio / 15);//counterWeight
}
