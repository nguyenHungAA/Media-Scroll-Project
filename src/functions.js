const enableWebcamButton = document.getElementById('enable-webcam');
const disableWebcamButton = document.getElementById('disable-webcam');
const gestureOutput = document.getElementById('gesture-output');
let webcamRunning = false;

import {
    FilesetResolver,
    GestureRecognizer
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js';

const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
);

const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
        delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numHands: 1
});

if (gestureRecognizer) {
    console.log('Gesture Recognizer initialized successfully');
} else {
    console.error('Failed to initialize Gesture Recognizer');
}

enableWebcamButton.addEventListener('click', async () => {
    enableWebcamButton.classList.add('inactive');
    disableWebcamButton.classList.remove('inactive');
    webcamRunning = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        let webcam = document.getElementById('webcam');
        // if webcam is null
        if (!webcam) {
            const webcamContainer = document.querySelector('#webcam-container');
            const webcam = document.createElement('video');
            webcam.id = 'webcam';
            webcam.autoplay = true;
            webcam.playsInline = true;
            webcam.srcObject = stream;
            webcamContainer.appendChild(webcam);

            webcam.addEventListener('loadeddata', () => {
                requestAnimationFrame(renderLoop);
            });
        } else {
            // if webcam is not null
            webcam.srcObject = stream;
            requestAnimationFrame(renderLoop);
        }
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
});



disableWebcamButton.addEventListener('click', () => {
    disableWebcamButton.classList.add('inactive');
    enableWebcamButton.classList.remove('inactive');
    webcamRunning = false;
    if (webcam) {
        const stream = webcam.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        webcam.remove();
    }
});


let lastVideoTime = -1;
let results = null;

function renderLoop() {
    if (!webcamRunning) {
        return;
    }

    // prevent browser from calling gesture too early
    // in case the webcam frame is not fully loaded
    if (!webcam || webcam.readyState < 2) {
        requestAnimationFrame(renderLoop);
        return;
    }

    let nowInMs = Date.now();
    if (webcam.currentTime !== lastVideoTime) {
        results = gestureRecognizer.recognizeForVideo(webcam, nowInMs);
        console.log('Gesture Recognition Result:', results);
        lastVideoTime = webcam.currentTime;
    }

    if (results && results.gestures.length > 0) {
        gestureOutput.textContent = results;
    }
    requestAnimationFrame(renderLoop);
}






