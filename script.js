import { PoseLandmarker, FilesetResolver } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import { resizeCanvases } from "./videoScript.js";
import { vec3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/+esm';


import { joints, bones, skipIndexes, calculatePositionDetails } from "./jointsAndBones.js";


export let poseLandmarker; 
// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `models/pose_landmarker_heavy.task`,
            delegate: "CPU"
        },
        runningMode: "IMAGE",
        numPoses: 2
    });
};
createPoseLandmarker();


function setupCanvas(image, parent, canvasId) {
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    canvas.className = "canvas";
    canvas.width = image.width;
    canvas.height = image.height;

    console.log("canvas Width: ", image.width);
    canvas.style.width = `${image.width}px`;
    canvas.style.height = `${image.height}px`;
    parent.appendChild(canvas);


    // Access the controls div
    const controlsDiv = document.getElementById('controls');

    // Create toggle button
    const toggleButton = document.createElement("button");
    toggleButton.innerText = canvasId.split('-')[1]; // Set text to just the layer number
    toggleButton.style.backgroundColor = 'red'; // Initial color
    toggleButton.className = 'frame-toggle-button'; 

    // Function to update button style based on canvas visibility
    function updateButtonStyle() {
        toggleButton.style.backgroundColor = canvas.style.display === 'none' ? 'lightcoral' : 'red';
    }

    // Set initial button style
    updateButtonStyle();

    toggleButton.onclick = function () {
        canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
        updateButtonStyle();
    };

    // Append the toggle button to the controls div
    controlsDiv.appendChild(toggleButton);
    return canvas;
}

function getCanvasCoords(landmark, canvas) {
    return {
        x: Math.round(landmark.x * canvas.width),
        y: Math.round(landmark.y * canvas.height)
    };
}

function calculateMidpoint(landmark1, landmark2) {
    return {
        x: (landmark1.x + landmark2.x) / 2,
        y: (landmark1.y + landmark2.y) / 2,
        z: (landmark1.z + landmark2.z) / 2
    };
}

export function drawLandmarks(result, img, canvasId, videoPlayer) {
    console.log("Drawing landmarks on canvas", canvasId);

    // Check if landmarks are detected
    if (!result || !result.landmarks || result.landmarks.length === 0) {
        alert("Landmark detection failed. Please try again with a different frame.");
        return; // Stop execution
    }

    // get landmarks (2d based), to draw on canvas
    let landmarks = result.landmarks[0];

    // Add virtual landmarks for spine
    const middleHips = calculateMidpoint(landmarks[joints.LHIP], landmarks[joints.RHIP]);
    const middleShoulders = calculateMidpoint(landmarks[joints.LSHOULDER], landmarks[joints.RSHOULDER]);
    landmarks[joints.BSPINE] = middleHips;
    landmarks[joints.TSPINE] = middleShoulders;
    
    // get canvas do draw the landmarks on
    const canvas = setupCanvas(img, img.parentNode, canvasId);
    const ctx = canvas.getContext('2d')
    // get scale factor to scale captured videoframe to canvas in video player
    const scale = videoPlayer.clientWidth / canvas.width;
    console.log("SCALE: ", scale);

    // Draw circles for all landmarks excluding the ones in skipIndexes
    landmarks.forEach((landmark, i) => {
        if (!skipIndexes.includes(i)) {
            drawCircle(landmark, ctx, scale);
        }
    });
    // Draw the bones
    drawLines(landmarks, bones, ctx, scale);

    // get landmarks (3d based), to calculate metrics and display in sidebar
    let worldLandmarks = result.worldLandmarks[0];
    const details = calculatePositionDetails(worldLandmarks);
    displayDetails(details, canvasId)

    // resize to fit the view window
//    console.log("displaywidth", `${videoPlayer.clientWidth}px`);
    canvas.style.width = `${videoPlayer.clientWidth}px`;
    canvas.style.height = `${videoPlayer.clientHeight}px`;

    // resize all canvases to fit the view window
    // don't know why, but fixes alignment issues
    resizeCanvases(); 
}


function drawCircle(landmark, ctx, scale) {
    console.log("Drawing circle");
    const { x, y } = getCanvasCoords(landmark, ctx.canvas);
    ctx.beginPath();
    ctx.arc(x, y, Math.round(3/scale), 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
}

function drawLines(landmarks, bones, ctx, scale) {
    console.log("Drawing lines");
    ctx.strokeStyle = 'red';
    ctx.lineWidth = Math.round(2/scale);
    // Iterate through the values of the bones object
    Object.values(bones).forEach(bone => {
        const [joint1Index, joint2Index] = bone;
        const joint1 = landmarks[joint1Index];
        const joint2 = landmarks[joint2Index];

        if (joint1 && joint2) {
            const start = getCanvasCoords(joint1, ctx.canvas);
            const end = getCanvasCoords(joint2, ctx.canvas);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    });
}



function displayDetails(results, canvasId) {
    const resultsDiv = document.getElementById('calculationResults');
    // Create a new div for each set of results
    let resultDiv = document.createElement('div');
    resultDiv.id = `resultsFor_${canvasId}`;
    let htmlContent = `<dl><dt>${canvasId}</dt>`;
    for (const key in results) {
        if (results.hasOwnProperty(key)) {
            htmlContent += `<dd>${key}: ${results[key]}</dd>`;
        }
    }
    htmlContent += '</dl>';
    resultDiv.innerHTML = htmlContent;
    // Append the new div to resultsDiv
    resultsDiv.appendChild(resultDiv);
}



