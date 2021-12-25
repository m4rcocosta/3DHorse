"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;
var translationMatrix;
var modelViewLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

// Horse's IDs
var torsoXId = 0;
var headYId = 1;
var leftUpperFrontLegId = 2;
var leftLowerFrontLegId = 3;
var rightUpperFrontLegId = 4;
var rightLowerFrontLegId = 5;
var leftUpperBackLegId = 6;
var leftLowerBackLegId = 7;
var rightUpperBackLegId = 8;
var rightLowerBackLegId = 9;
var tailId = 10;
var neckId = 11;
var headZId = 17;
var torsoYId = 18;
var torsoZId = 19;
// Obstacle's IDs
var leftColumnId = 12;
var rightColumnId = 13;
var rowId = 14;
var row2Id = 15;
var grassId = 16;

// Horse's Dimentions
var torsoHeight = 5.0;
var torsoWidth = 2.0;
var upperLegHeight = 2.5;
var lowerLegHeight = 2.5;
var upperLegWidth  = 0.8;
var lowerLegWidth  = 0.6;
var headHeight = 1.5;
var headWidth = 0.9;
var tailHeight = 2.5;
var tailWidth = 0.7;
var neckHeight = 3;
var neckWidth = 1;
// Obstacle's dimensions
var obstacleColumnHeight = 6.0;
var obstacleColumnWidth = 2.0;
var obstacleRowHeight = 10.0;
var obstacleRowWidth = 0.5;
var grassWidth = 0.2;
var grassHeight = 110;

var numNodes = 17;
var numVertices = 24;

var theta = [0, 0, 180, 0, 180, 0, 170, 20, 170, 20, 135, -45, 0, 0, 0, 0, 0, -90, 0, 0];


var stack = [];
var figure = [];

for(var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var pointsArray = [];

//Translations
var xId = 0, yId = 1, zId = 2;
var translations = [0, 0, 0];

//Camera
var near = -20.0;
var far = 150.0;
var radius = 1.0;
var thetaCamera = -45.0 * Math.PI/180.0;
var phiCamera = 35.0 * Math.PI/180.0;
//Camera position
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
//-------------------------------------------
function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}
//--------------------------------------------
//texture
var torsoTexture, horseTexture, obstacleTexture, grassTexture, checkerboardTexture, linearDecreaseTexture;
var c;
var texSize = 256;
var numChecks = 8;
var texCoordsArray = [];
var texLinearCoordsArray = [];
var checkerboard = new Uint8Array(4*texSize*texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i/(texSize/numChecks));
        var patchy = Math.floor(j/(texSize/numChecks));
        if(patchx%2 ^ patchy%2) c = 255;
        else c = 0;
        checkerboard[4*i*texSize+4*j] = c;
        checkerboard[4*i*texSize+4*j+1] = c;
        checkerboard[4*i*texSize+4*j+2] = c;
        checkerboard[4*i*texSize+4*j+3] = 255;
    }
}
var linearDecrease = new Uint8Array(4*texSize*texSize);
for (var i = 0; i < texSize/2; i++) {
    //Other 4 faces
    for(var j = 0; j < texSize; j++) {
        linearDecrease[4*i*texSize+4*j] = j;
        linearDecrease[4*i*texSize+4*j+1] = j;
        linearDecrease[4*i*texSize+4*j+2] = j;
        linearDecrease[4*i*texSize+4*j+3] = 255;
    }
}
for (var i = texSize/2; i < texSize; i++) {
    //Dark
    for (var j = 0; j < texSize/2; j++) {
        linearDecrease[4*i*texSize+4*j] = 16;
        linearDecrease[4*i*texSize+4*j+1] = 16;
        linearDecrease[4*i*texSize+4*j+2] = 16;
        linearDecrease[4*i*texSize+4*j+3] = 255;
    }
    //Intense
    for (var j = texSize/2; j < texSize; j++) {
        linearDecrease[4*i*texSize+4*j] = 255;
        linearDecrease[4*i*texSize+4*j+1] = 255;
        linearDecrease[4*i*texSize+4*j+2] = 255;
        linearDecrease[4*i*texSize+4*j+3] = 255;
    }
}
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
var texLinearCoord = [
    //Lat Dx
    vec2(0.0,  0.5),
    vec2(0.0,  1.0),
    vec2(1.0,  1.0),
    vec2(1.0,  0.5),

    //Front
    vec2(0.5,  0.0),
    vec2(0.5,  0.5),
    vec2(1.0,  0.5),
    vec2(1.0,  0.0),

    //Down
    vec2(0.0,  0.5),
    vec2(0.0,  1.0),
    vec2(1.0,  1.0),
    vec2(1.0,  0.5),

    //Up
    vec2(0.0,  0.5),
    vec2(0.0,  1.0),
    vec2(1.0,  1.0),
    vec2(1.0,  0.5),

    //Lat sx
    vec2(0.0,  0.5),
    vec2(0.0,  1.0),
    vec2(1.0,  1.0),
    vec2(1.0,  0.5),

    //Back
    vec2(0.0,  0.0),
    vec2(0.0,  0.5),
    vec2(0.5,  0.5),
    vec2(0.5,  0.0)
];
function configureTexture() {
    checkerboardTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, checkerboard);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "checkerboardTexture"), 0);

    linearDecreaseTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, linearDecreaseTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, linearDecrease);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "linearDecreaseTexture"), 1);

    torsoTexture = gl.createTexture();
    var torsoTextureImage = document.getElementById("torsoTextureImage");
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, torsoTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, torsoTextureImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "torsoTexture"), 2);

    horseTexture = gl.createTexture();
    var horseTextureImage = document.getElementById("horseTextureImage");
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, horseTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, horseTextureImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "horseTexture"), 3);

    obstacleTexture = gl.createTexture();
    var obstacleTextureImage = document.getElementById("obstacleTextureImage");
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, obstacleTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obstacleTextureImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, "obstacleTexture"), 4);

    grassTexture = gl.createTexture();
    var grassTextureImage = document.getElementById("grassTextureImage");
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grassTextureImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "grassTexture"), 5);

}

//----------------------------------
//Animation
var animate = false;
var endX = 45.0;
var myTime = 0.0;
var prepareJumpTime = 15.5;
var jumpTime = 16.5;
var goDownTime = 21.5;
var rTime = 27.5;
var landTime = 29.5;
var restartTime = 0.0;
var senseLeftFront = true, senseRightFront = true, senseLeftBack = true, senseRightBack = true;
function interpolate(min, max, fraction) {
    return (max - min) * fraction + min;
}
function performAnimation() {
    for(i = 0; i < numNodes; i++) initNodes(i);
    if(myTime > 0.5) translations[xId] += 0.1; //move along x-axes
    myTime += 0.1; //time variable
    if(theta[leftUpperFrontLegId] >= 0.95 * 220) senseLeftFront = false;
    if(theta[leftUpperFrontLegId] <= 1.05 * 140) senseLeftFront = true;
    if(theta[rightUpperFrontLegId] >= 0.95 * 220) senseRightFront = false;
    if(theta[rightUpperFrontLegId] <= 1.05 * 140) senseRightFront = true;
    if(theta[leftUpperBackLegId] >= 0.95 * 210) senseLeftBack = false;
    if(theta[leftUpperBackLegId] <= 1.05 * 150) senseLeftBack = true;
    if(theta[rightUpperBackLegId] >= 0.95 * 210) senseRightBack = false;
    if(theta[rightUpperBackLegId] <= 1.05 * 150) senseRightBack = true;
    //gallop
    if(myTime < prepareJumpTime) {
        if(myTime > 0.0) {
            if(senseLeftFront) {
                theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 220, 0.1);
                theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], -50, 0.1);
            }
            else {
                theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 140, 0.1);
                theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], 10, 0.1);
            }
        }
        if(myTime > 2.0) {
            if(senseRightFront) {
                theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 220, 0.1);
                theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], -50, 0.1);
            }
            else {
                theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 140, 0.1);
                theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], 10, 0.1);
            }
        }
        if(myTime > 2.0) {
            if(senseLeftBack) {
                theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 210, 0.08);
                theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 30, 0.08);
            }
            else {
                theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 150, 0.08);
                theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 10, 0.08);
            }
        }
        if(myTime > 0.0) {
            if(senseRightBack) {
                theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 210, 0.08);
                theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 30, 0.08);
            }
            else {
                theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 150, 0.08);
                theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 10, 0.08);
            }
        }
    }
    //prepare for jump
    if(myTime >= prepareJumpTime && myTime < jumpTime) {
        theta[torsoZId] += 3;
        theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 140, 0.1);
        theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], -50, 0.1);
        theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 140, 0.1);
        theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], -50, 0.1);
        theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 140, 0.1);
        theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 10, 0.1);
        theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 140, 0.1);
        theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 10, 0.1);
        translations[xId] -= 0.1;  //stop
        translations[yId] += 0.1;
    }
    //jump
    if(myTime >= jumpTime && myTime < goDownTime) {
        translations[xId] += 0.05;
        translations[yId] += 0.12;
    }
    // go down
    if(myTime >= goDownTime && myTime < landTime) {
        translations[yId] -= 0.07;
        translations[xId] += 0.02;
        if(myTime < rTime) {
            theta[torsoZId] -= 1;
            theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 220, 0.05);
            theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 220, 0.05);
            theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 200, 0.05);
            theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 200, 0.05);
            theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], 0, 0.05);
            theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], 0, 0.05);
            theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 10, 0.05);
            theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 10, 0.05);
        }
    }
    //Land
    if(myTime > landTime) {
        if (theta[torsoZId] < 0) {
            translations[xId] -= 0.1;  //stop
            theta[torsoZId] += 1;
            theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 180, 0.05);
            theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 180, 0.05);
            theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 180, 0.05);
            theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 180, 0.05);
            translations[yId] -= 0.043;
            restartTime = myTime;
        }
        else {
            if(myTime > restartTime) {
                if(senseLeftFront) {
                    theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 220, 0.1);
                    theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], -50, 0.1);
                }
                else {
                    theta[leftUpperFrontLegId] = interpolate(theta[leftUpperFrontLegId], 140, 0.1);
                    theta[leftLowerFrontLegId] = interpolate(theta[leftLowerFrontLegId], 10, 0.1);
                }
            }
            if(myTime > restartTime + 2.0) {
                if(senseRightFront) {
                    theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 220, 0.1);
                    theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], -50, 0.1);
                }
                else {
                    theta[rightUpperFrontLegId] = interpolate(theta[rightUpperFrontLegId], 140, 0.1);
                    theta[rightLowerFrontLegId] = interpolate(theta[rightLowerFrontLegId], 10, 0.1);
                }
            }
            if(myTime > restartTime + 2.0) {
                if(senseLeftBack) {
                    theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 210, 0.08);
                    theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 30, 0.08);
                }
                else {
                    theta[leftUpperBackLegId] = interpolate(theta[leftUpperBackLegId], 150, 0.08);
                    theta[leftLowerBackLegId] = interpolate(theta[leftLowerBackLegId], 10, 0.08);
                }
            }
            if(myTime > restartTime) {
                if(senseRightBack) {
                    theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 210, 0.08);
                    theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 30, 0.08);
                }
                else {
                    theta[rightUpperBackLegId] = interpolate(theta[rightUpperBackLegId], 150, 0.08);
                    theta[rightLowerBackLegId] = interpolate(theta[rightLowerBackLegId], 10, 0.08);
                }
            }
        }
    }
    //Reset
    if(translations[xId] >= endX) {
        myTime = 0.0;
        restartTime = 0.0;
        senseLeftFront = true, senseRightFront = true, senseLeftBack = true, senseRightBack = true;
        translations = [0, 0, 0];
        theta = [0, 0, 180, 0, 180, 0, 170, 20, 170, 20, 135, -45, 0, 0, 0, 0, 0, -90, 0, 0];
        for(i = 0; i < numNodes; i++) initNodes(i);
        document.getElementById("startButton").innerText = "START";
        animate = false;
    }
}

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

function initNodes(Id) {
    var m = mat4();

    switch(Id) {
        case torsoXId:
        case torsoYId:
        case torsoZId:
            m = translate(-22.0, -4.3, 0.0);
            m = mult(m, translate(translations[xId], translations[yId], translations[zId]));
            m = mult(m, rotate(theta[torsoXId], 1, 0, 0 ));
            m = mult(m, rotate(theta[torsoYId], 0, 1, 0 ));
            m = mult(m, rotate(theta[torsoZId], 0, 0, 1 ));
            figure[torsoXId] = createNode( m, torso, null, neckId );
            break;

        case neckId:
            m = translate(0.4 * torsoHeight, 1.5 * torsoWidth, 0.0);
        	m = mult(m, rotate(theta[neckId], 0, 0, 1));
            figure[neckId] = createNode( m, neck, leftUpperFrontLegId, headYId);
            break;

        case headYId:
        case headZId:
            m = translate(0.0, 0.8 * neckHeight, 0.0);
        	m = mult(m, rotate(theta[headYId], 0, 1, 0));
        	m = mult(m, rotate(theta[headZId], 0, 0, 1))
            figure[headYId] = createNode( m, head, null, null);
            break;

        case leftUpperFrontLegId:
            m = translate(0.8 * torsoHeight/2, torsoWidth/2 + 0.5 * upperLegHeight, -torsoWidth/2);
        	m = mult(m, rotate(theta[leftUpperFrontLegId], 0, 0, 1));
            figure[leftUpperFrontLegId] = createNode( m, upperLeg, rightUpperFrontLegId, leftLowerFrontLegId );
            break;

        case rightUpperFrontLegId:
            m = translate(0.8 * torsoHeight/2, torsoWidth/2 + 0.5 * upperLegHeight, torsoWidth/2);
        	m = mult(m, rotate(theta[rightUpperFrontLegId], 0, 0, 1));
            figure[rightUpperFrontLegId] = createNode( m, upperLeg, leftUpperBackLegId, rightLowerFrontLegId );
            break;

        case leftUpperBackLegId:
            m = translate(-0.8 * torsoHeight/2, torsoWidth/2 + 0.5 * upperLegHeight, -torsoWidth/2);
        	m = mult(m , rotate(theta[leftUpperBackLegId], 0, 0, 1));
            figure[leftUpperBackLegId] = createNode( m, upperLeg, rightUpperBackLegId, leftLowerBackLegId );
            break;

        case rightUpperBackLegId:
            m = translate(-0.8 * torsoHeight/2, torsoWidth/2 + 0.5 * upperLegHeight, torsoWidth/2);
        	m = mult(m, rotate(theta[rightUpperBackLegId], 0, 0, 1));
            figure[rightUpperBackLegId] = createNode( m, upperLeg, tailId, rightLowerBackLegId );
            break;

        case leftLowerFrontLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerFrontLegId], 0, 0, 1));
            figure[leftLowerFrontLegId] = createNode( m, lowerLeg, null, null );
            break;

        case rightLowerFrontLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerFrontLegId], 0, 0, 1));
            figure[rightLowerFrontLegId] = createNode( m, lowerLeg, null, null );
            break;

        case leftLowerBackLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerBackLegId], 0, 0, 1));
            figure[leftLowerBackLegId] = createNode( m, lowerLeg, null, null );
            break;

        case rightLowerBackLegId:
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerBackLegId], 0, 0, 1));
            figure[rightLowerBackLegId] = createNode( m, lowerLeg, null, null );
            break;

        case tailId:
            m = translate(-0.9 * torsoHeight/2, 1.2 * torsoWidth, 0.0);
        	m = mult(m, rotate(theta[tailId], 0, 0, 1))
            figure[tailId] = createNode( m, tail, null, null);
            break;

        case leftColumnId:
            m = translate(0.0, -4.0, obstacleRowHeight/2);
            figure[leftColumnId] = createNode( m, column, null, rightColumnId);
            break;

        case rightColumnId:
            m = translate(0.0, 0.0, -obstacleRowHeight);
            figure[rightColumnId] = createNode( m, column, rowId, null);
            break;

        case rowId:
            m = translate(0.0, obstacleColumnHeight/4, -obstacleRowHeight/2);
            figure[rowId] = createNode( m, row, row2Id, null);
            break;

        case row2Id:
            m = translate(0.0, -obstacleColumnHeight/8, -obstacleRowHeight/2);
            figure[row2Id] = createNode( m, row, grassId, null);
            break;

        case grassId:
            m = translate(0.0, -obstacleColumnHeight/2, -obstacleRowHeight/2);
            figure[grassId] = createNode( m, grass, null, null);
            break;
    }
}

function traverse(Id) {
    if(Id == null) return;

    //Apply texture/color?
    var isTorso = false, isObstacle = false, isGrass = false;
    if(Id == torsoXId) isTorso = true;
    else if(Id == leftColumnId || Id == rightColumnId || Id == rowId || Id == row2Id) isObstacle = true;
    else if(Id == grassId) isGrass = true;
    gl.uniform1i(gl.getUniformLocation(program, "isTorso"), isTorso);
    gl.uniform1i(gl.getUniformLocation(program, "isObstacle"), isObstacle);
    gl.uniform1i(gl.getUniformLocation(program, "isGrass"), isGrass);

    //Render
    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoHeight, torsoWidth, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function neck() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * neckHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(neckWidth, neckHeight, neckWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerLeg() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0));
	instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i  =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function column() {
	instanceMatrix = mult(modelViewMatrix, scale4(obstacleColumnWidth, obstacleColumnHeight, obstacleColumnWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i  =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function row() {
	instanceMatrix = mult(modelViewMatrix, scale4(obstacleRowWidth, obstacleRowWidth, obstacleRowHeight));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i  =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function grass() {
	instanceMatrix = mult(modelViewMatrix, scale4(grassHeight, grassWidth, grassHeight/2));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i  =0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    for(var i = 0; i < 4; i++) texCoordsArray.push(texCoord[i]);
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(0, 4, 7, 3);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
    for(var i = 0; i < numVertices; i++) texLinearCoordsArray.push(texLinearCoord[i]);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.53, 0.8, 0.92, 1.0);
    gl.enable(gl.DEPTH_TEST); //For viewing depth

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    cube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Controllers
    document.getElementById("torsoXSlider").oninput = function(event) {
        theta[torsoXId] = event.target.value;
        initNodes(torsoXId);
        document.getElementById("torsoXValue").innerText = event.target.value;
    };
    document.getElementById("torsoYSlider").oninput = function(event) {
         theta[torsoYId] = event.target.value;
         initNodes(torsoYId);
         document.getElementById("torsoYValue").innerText = event.target.value;
    };
    document.getElementById("torsoZSlider").oninput = function(event) {
         theta[torsoZId] = event.target.value;
         initNodes(torsoZId);
         document.getElementById("torsoZValue").innerText = event.target.value;
    };
    document.getElementById("headYSlider").oninput = function(event) {
        theta[headYId] = event.target.value;
        initNodes(headYId);
        document.getElementById("headYValue").innerText = event.target.value;
    };
    document.getElementById("headZSlider").oninput = function(event) {
         theta[headZId] = event.target.value;
         initNodes(headZId);
         document.getElementById("headZValue").innerText = event.target.value;
    };
    document.getElementById("leftUpperFrontLegSlider").oninput = function(event) {
         theta[leftUpperFrontLegId] = event.target.value;
         initNodes(leftUpperFrontLegId);
         document.getElementById("leftUpperFrontLegValue").innerText = event.target.value;
    };
    document.getElementById("leftLowerFrontLegSlider").oninput = function(event) {
         theta[leftLowerFrontLegId] =  event.target.value;
         initNodes(leftLowerFrontLegId);
         document.getElementById("leftLowerFrontLegValue").innerText = event.target.value;
    };
    document.getElementById("rightUpperFrontLegSlider").oninput = function(event) {
        theta[rightUpperFrontLegId] = event.target.value;
        initNodes(rightUpperFrontLegId);
        document.getElementById("rightUpperFrontLegValue").innerText = event.target.value;
    };
    document.getElementById("rightLowerFrontLegSlider").oninput = function(event) {
         theta[rightLowerFrontLegId] =  event.target.value;
         initNodes(rightLowerFrontLegId);
         document.getElementById("rightLowerFrontLegValue").innerText = event.target.value;
    };
    document.getElementById("leftUpperBackLegSlider").oninput = function(event) {
        theta[leftUpperBackLegId] = event.target.value;
        initNodes(leftUpperBackLegId);
        document.getElementById("leftUpperBackLegValue").innerText = event.target.value;
    };
    document.getElementById("leftLowerBackLegSlider").oninput = function(event) {
         theta[leftLowerBackLegId] = event.target.value;
         initNodes(leftLowerBackLegId);
         document.getElementById("leftLowerBackLegValue").innerText = event.target.value;
    };
    document.getElementById("rightUpperBackLegSlider").oninput = function(event) {
         theta[rightUpperBackLegId] =  event.target.value;
         initNodes(rightUpperBackLegId);
         document.getElementById("rightUpperBackLegValue").innerText = event.target.value;
    };
    document.getElementById("rightLowerBackLegSlider").oninput = function(event) {
        theta[rightLowerBackLegId] = event.target.value;
        initNodes(rightLowerBackLegId);
        document.getElementById("rightLowerBackLegValue").innerText = event.target.value;
    };
    document.getElementById("neckSlider").oninput = function(event) {
         theta[neckId] = event.target.value;
         initNodes(neckId);
         document.getElementById("neckValue").innerText = event.target.value;
    };
    document.getElementById("tailSlider").oninput = function(event) {
         theta[tailId] = event.target.value;
         initNodes(tailId);
         document.getElementById("tailValue").innerText = event.target.value;
    };
    document.getElementById("sliderX").oninput = function(event) {
         translations[xId] = event.target.value;
         initNodes(torsoXId);
         document.getElementById("xValue").innerText = event.target.value;
    };
    document.getElementById("sliderY").oninput = function(event) {
         translations[yId] = event.target.value;
         initNodes(torsoXId);
         document.getElementById("yValue").innerText = event.target.value;
    };
    document.getElementById("sliderZ").oninput = function(event) {
         translations[zId] = event.target.value;
         initNodes(torsoXId);
         document.getElementById("zValue").innerText = event.target.value;
    };
    document.getElementById("thetaCameraSlider").oninput = function(event) {
        thetaCamera = event.target.value * Math.PI/180.0;
        document.getElementById('thetaCameraValue').innerText = this.valueAsNumber;
    };
    document.getElementById("phiCameraSlider").oninput = function(event) {
        phiCamera = event.target.value * Math.PI/180.0;
        document.getElementById('phiCameraValue').innerText = this.valueAsNumber;
    };
    //Animate
    document.getElementById("startButton").onclick = function() {
        animate = !animate;
        if(this.innerText == "START") this.innerText = "PAUSE";
        else this.innerText = "START";
    };
    document.getElementById("changeViewButton").onclick = function() {
        if(thetaCamera == -45 * Math.PI/180.0) thetaCamera = 135 * Math.PI/180.0;
        else thetaCamera = -45 * Math.PI/180.0;
    };

    //Checkerboard Texture Coord
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    //Linear Texture Coord
    var tLinearBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tLinearBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texLinearCoordsArray), gl.STATIC_DRAW);
    var vLinearTexCoord = gl.getAttribLocation(program, "vLinearTexCoord");
    gl.vertexAttribPointer(vLinearTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vLinearTexCoord);

    configureTexture();

    for(i = 0; i < numNodes; i++) initNodes(i);

    render();
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    //Camera
    eye = vec3(radius * Math.sin(thetaCamera), radius * Math.sin(phiCamera), radius * Math.cos(thetaCamera));
    modelViewMatrix = lookAt(eye, at , up);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));

    projectionMatrix = ortho(-20.0, 20.0, -20.0, 20.0, near, far);
    //projectionMatrix = perspective(60, gl.canvas.clientWidth/gl.canvas.clientHeight, -10, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    traverse(torsoXId);
    traverse(leftColumnId);
    if(animate) performAnimation();
    requestAnimFrame(render);
}
