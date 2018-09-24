// Liveplot.js -- a p5js scene by Tim Schäfer.
// This is free software, published under the GPLv3 license. No warranties.

// +++ Settings +++
var numDots = 50;   // number of rows of the field
var numPositionsPerDot = 20;      // number of target positions per line, or columns (vertical lines)
var numLines = 15;           // number of the moving, colorful plot lines
var numPositionsToDrawForLine = 18;

var doDrawPotentialTargetPoints = false;
var doDrawTargetPoints = false;
var doDrawCurrentPoints = false;
var doDrawVerticalGridLines = true;
var doDrawHorizontalGridLines = true;
var doDrawMaxDrawXLine = false;
var doDrawXLabels = true;
var doDrawYLabels = true;
var doDrawSumAtVerticalLineBottom = true;

var doUseMouseAttraction = true;

var backGroundColor = 80;
var verticalLinesColor = 160;
var horizontalLinesColor = 160;
var useTextSize = 8;
var textColor = 255;
// +++ End of settings ++++

var minDistToTrackedMouseYPos;
var dotPositions = [];
var linesYSpots = [];
var maxXDrawLine;
var interDotDistanceY;
var interDotPositionDistanceX;
var nextLineYSpot;
var someColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000' ];

function setup() {
	frameRate(30);
  createCanvas(600, 400);
  textSize(useTextSize);
	interDotDistanceY = (height/numDots);
  interDotPositionDistanceX = (width/numPositionsPerDot);

	for (var i = 0; i < numDots; i++) {
    var currentYPos = i * interDotDistanceY + 0.5 * interDotDistanceY;
    for (var j = 0; j <= numPositionsPerDot; j++) {
      var currentXPos = j * interDotPositionDistanceX + 0.5 * interDotPositionDistanceX;
		    dotPositions.push([currentXPos, currentYPos]);
    }
	}

  maxDrawLineX = dotPositions[numPositionsToDrawForLine-2][0] + 0.5 * interDotPositionDistanceX;

  nextLineYSpot = [];
  for (var k = 0; k < numLines; k++) {
    var currentLineYSpots = [];
    for (var l = 0; l < numPositionsToDrawForLine; l++) {
      currentLineYSpots.push(getRandomInt(0, numDots-1));
    }
    linesYSpots.push(currentLineYSpots);
    var nextRandomYSpot = getRandomYPositionPotentiallyWithMouseBonus(0, numDots-1);
    nextLineYSpot.push(nextRandomYSpot);
  }
}

function draw() {
  background(backGroundColor);
	// move Dots
  var jumpThisFrame = false;
	for (var i = 0; i < dotPositions.length; i++) {
    dotPositions[i][0] -= 2;
		if(dotPositions[i][0] < -interDotPositionDistanceX) {  // reset if it left screen
      var howMuchSmaller = -interDotPositionDistanceX -dotPositions[i][0];
		  dotPositions[i][0] = width - howMuchSmaller;
      jumpThisFrame = true;
		}
	}

  if(jumpThisFrame) {
    // draw new random next points for all lines
    for (var k = 0; k < numLines; k++) {
      linesYSpots[k].shift();
      linesYSpots[k].push(nextLineYSpot[k]);
      nextLineYSpot[k] = getRandomYPositionPotentiallyWithMouseBonus(0, numDots-1);
    }
  }

  if(doDrawYLabels || doDrawHorizontalGridLines) {
    fill(textColor);
    for (var i = 0; i < numDots; i++) {
      if(i > 0 && i % floor(numDots/10) == 0) {
        var currentYPos = i * interDotDistanceY + 0.5 * interDotDistanceY;
        text(""+i, width -15, currentYPos);
        stroke(horizontalLinesColor);
        line(0, currentYPos, width, currentYPos);
      }
    }
	}

  // draw maxDrawLineX
  if(doDrawMaxDrawXLine) {
    stroke(color(0, 255, 0));
    line(maxDrawLineX, 0, maxDrawLineX, height);
  }
  stroke(color(0));

	// draw dots
	fill(color(255, 0, 0));
  if (doDrawPotentialTargetPoints) {
	  for (var j = 0; j < dotPositions.length; j++) {
		  ellipse(dotPositions[j][0], dotPositions[j][1], 5);
	  }
  }



  // advance Y spots

  // draw lines
  //  - find the current X positions of all points
  var currentPointXPositions = [];
  stroke(verticalLinesColor);
  for (var l = 0; l <= numPositionsPerDot; l++) {
    currentPointXPositions[l] = dotPositions[l][0];
    if(doDrawXLabels) {
      fill(textColor);
      text(" "+l, currentPointXPositions[l], 10);
    }
    // draw vertical lines
    if(doDrawVerticalGridLines) {
      line(currentPointXPositions[l], 0, currentPointXPositions[l], height);
    }
  }
  stroke(color(0));
  // - sort by X values
  sortWithIndeces(currentPointXPositions);
  // - draw lines between first numPositionsToDrawForLine points

  // draw sum
  if(doDrawSumAtVerticalLineBottom) {
    fill(textColor);
    var numToSkipAtEnd = numPositionsPerDot - numPositionsToDrawForLine;
    var sumOfSums = 0;
    for(var m=0; m < currentPointXPositions.sortIndices.length; m++) {
      var idx=currentPointXPositions.sortIndices[m];
      var sumAtLinePosition = 0;
      for(var n=0; n < numLines; n++) {
        sumAtLinePosition += linesYSpots[n][idx];
      }
      var labelToPlot = " "+sumAtLinePosition;
      if(isNaN(sumAtLinePosition)) {
        sumAtLinePosition = 0;
        labelToPlot = "";
      }
      text(labelToPlot, currentPointXPositions[idx], height - 5);
      sumOfSums += sumAtLinePosition;
    }
    fill(textColor);
    text("m="+round(sumOfSums/numLines), width - 35, height - 5);
  }

// draw red marker in upper right corner to show user that mouse tracking is active
if(doUseMouseAttraction && mouseRoughlyWithFrame()) {
    fill(color(255, 0, 0));
    ellipse(width -20, 20, 10);
    stroke(color(255, 0, 0));
    line(0, mouseY, width, mouseY);
}

  for (var k = 0; k < numLines; k++) {
    var thisLineYSpots = linesYSpots[k]; // these are only the indices, i.e., row numbers
    //print("Line " + k + " last y spots: " + thisLineYSpots.join(",") + ". Next=" + nextLineYSpot[k]);

    var thisLineYPositionsOfSpots = []; // y coordinates
    for (var l = 0; l < numPositionsToDrawForLine; l++) {
      thisLineYPositionsOfSpots[l] = thisLineYSpots[l] * interDotDistanceY + 0.5 * interDotDistanceY;
    }
    //print("Line " + k + " y positions: " + thisLineYPositionsOfSpots.join(","));


    var positionShare = currentPointXPositions[0] / width;     // make alpha depend on screen position (less tansparent the more it gets to the right)
    var colorNoAlpha = color(someColors[k]);
    var newAlpha = 100 + positionShare * 155;
    var colorAlpha = color(red(colorNoAlpha), green(colorNoAlpha), blue(colorNoAlpha), newAlpha);
    stroke(colorAlpha);

    strokeWeight(4);
    line(0, thisLineYPositionsOfSpots[0], currentPointXPositions[0], thisLineYPositionsOfSpots[0]);
    for (var l = 0; l <= numPositionsToDrawForLine; l++) {
      positionShare = currentPointXPositions[l] / width;     // make alpha depend on screen position (less tansparent the more it gets to the right)
      colorNoAlpha = color(someColors[k]);
      newAlpha = 100 + positionShare * 155;
      colorAlpha = color(red(colorNoAlpha), green(colorNoAlpha), blue(colorNoAlpha), newAlpha);
      stroke(colorAlpha);

      line(currentPointXPositions[l], thisLineYPositionsOfSpots[l], currentPointXPositions[l+1], thisLineYPositionsOfSpots[l+1]);
    }
    // Draw line towards next point: compute y position at x position maxDrawLineX
    var nextY = nextLineYSpot[k] * interDotDistanceY + 0.5 * interDotDistanceY;
    var lastY = thisLineYPositionsOfSpots[numPositionsToDrawForLine-1];
    var lastX = currentPointXPositions[numPositionsToDrawForLine-1];
    var nextX = currentPointXPositions[numPositionsToDrawForLine];
    var yDiff = nextY - lastY;
    var xDiff = nextX - lastX;
    var ascent = yDiff / xDiff;
    var xDiffToMaxDrawLineX = maxDrawLineX - lastX;
    var yAtmaxDrawLineX = lastY + (ascent * xDiffToMaxDrawLineX);
    line(currentPointXPositions[numPositionsToDrawForLine-1], lastY, maxDrawLineX, yAtmaxDrawLineX);
    strokeWeight(1);
    //print("Line " + k + ": ascent=" + ascent +", nextY=" + nextY +", lastY=" +lastY + ". lastX=" + lastX + " ,nextX=" + nextX + ". xDiff=" + xDiff + " (interDotPositionDistanceX=" + interDotPositionDistanceX + "), yDiff=" + yDiff);

    if(doDrawCurrentPoints) {
      fill(color(255,127,80));    // draw current dot in orange (stroke with current line's color)
      ellipse(lastX, lastY, 10);
    }
    if(doDrawTargetPoints) {
      fill(color(255, 255, 0));   // draw next target in yellow (stroke with current line's color)
      ellipse(nextX, nextY, 10);
    }
  }
}

// function sortWithIndeces by Dave Aaron Smith, see https://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
function sortWithIndeces(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mouseRoughlyWithFrame() {
  var border = 10;
  return mouseX > border && mouseX < (width - border) && mouseY > border && mouseY < (height - border);
}

function getRandomYPositionPotentiallyWithMouseBonus(min, max) {
  if(doUseMouseAttraction && mouseRoughlyWithFrame()) {
    // find y spot closest to mouse position
    var minDistToMouse = Number.POSITIVE_INFINITY;
    var minDistIndex = 0;
    for(var p=0; p < numDots; p++) {
      var currentYPosDot = p * interDotDistanceY + 0.5 * interDotDistanceY;
      if(abs(currentYPosDot - mouseY) < minDistToMouse) {
        minDistToMouse = abs(currentYPosDot - mouseY);
        minDistIndex = p;
        minDistToTrackedMouseYPos = currentYPosDot;
      }
    }
    // with a certain probability, draw the line closest to the mouse
    if(getRandomInt(1, 10) < 4) {
      return minDistIndex;
    }
  }
  return getRandomInt(min, max);
}
