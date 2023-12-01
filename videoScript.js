import { poseLandmarker, drawLandmarks } from "./script.js";

document.addEventListener('DOMContentLoaded', (event) => {
    const videoInput = document.getElementById('video-input');
    const videoPlayer = document.getElementById('videoPlayer');
    const playButton = document.getElementById('playButton');
    const slowMotionButton = document.getElementById('slowMotionButton');
    const frameBackButton = document.getElementById('frameBackButton');
    const frameForwardButton = document.getElementById('frameForwardButton');
    const removeFramesButton = document.getElementById('removeFramesButton');

    const frameRate = 25; // Aangenomen frame rate
    const frameDuration = 1 / frameRate;

    playButton.addEventListener('click', function () {
        if (videoPlayer.paused) {
            videoPlayer.playbackRate = 1;
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });

    slowMotionButton.addEventListener('click', function () {
        if (videoPlayer.paused || videoPlayer.playbackRate === 1) {
            videoPlayer.playbackRate = 0.2; // Slow motion rate
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
    });

    frameBackButton.addEventListener('click', function () {
        if (!videoPlayer.paused) {
            videoPlayer.pause();
        } else if (videoPlayer.currentTime > 0) {
            videoPlayer.currentTime -= frameDuration;
        }
    });

    frameForwardButton.addEventListener('click', function () {
        if (!videoPlayer.paused) {
            videoPlayer.pause();
        } else if (videoPlayer.currentTime < videoPlayer.duration) {
            videoPlayer.currentTime += frameDuration;
        }
    });

    videoInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            videoPlayer.src = URL.createObjectURL(e.target.files[0]);
            videoPlayer.load();
        }
    });

    analyseButton.addEventListener('click', function () {
        analyseCurrentFrame(videoPlayer);
    });

    removeFramesButton.addEventListener('click', function () {
        removeCanvasFrames();
        removeFrameButtons();
        canvasIdCounter = 0;
        document.getElementById('calculationResults').innerHTML = '';
    });
});


function captureFrame(videoPlayer, frameCanvas) {
    frameCanvas.width = videoPlayer.videoWidth;
    frameCanvas.height = videoPlayer.videoHeight;
    const ctx = frameCanvas.getContext('2d');
    ctx.drawImage(videoPlayer, 0, 0, frameCanvas.width, frameCanvas.height);
    console.log("Frame captured");    
}



async function analyseCurrentFrame(videoPlayer) {
    console.log("Huidige frame wordt geanalyseerd");

    const img_to_analyse = document.getElementById('frameCanvas');
    captureFrame(videoPlayer, frameCanvas);

    try {
        const poseLandmarkerResult = await poseLandmarker.detect(img_to_analyse);
        console.log(poseLandmarkerResult);
        drawLandmarks(poseLandmarkerResult, img_to_analyse, generateCanvasId(), videoPlayer);
    } catch (error) {
        console.error("Error in pose detection: ", error);
    }
}

function removeCanvasFrames() {
    const frames = document.querySelectorAll('.canvas');
    frames.forEach(frame => frame.remove());
}

function removeFrameButtons() {
    const buttons = document.querySelectorAll('.frame-toggle-button')
    buttons.forEach(button => button.remove());
}

let canvasIdCounter = 0;
function generateCanvasId() {
    return `frame-${++canvasIdCounter}`;
}

export function resizeCanvases() {
    const videoPlayer = document.getElementById('videoPlayer');
    const canvases = document.querySelectorAll('.canvas');

    canvases.forEach(canvas => {
        canvas.style.width = `${videoPlayer.clientWidth}px`;
        canvas.style.height = `${videoPlayer.clientHeight}px`;
    });
}

// Create a ResizeObserver instance
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        // Assuming you want to resize canvases when the videoPlayer size changes
        if (entry.target.id === 'videoPlayer') {
            resizeCanvases();
        }
    }
});

// Start observing the video player
const videoPlayer = document.getElementById('videoPlayer');
resizeObserver.observe(videoPlayer);