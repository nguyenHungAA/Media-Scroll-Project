import {
    GestureRecognizer,
    FilesetResolver,
} from "/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs";

let gestureRecognizer = null;
let result;
let video;
let playPromise;
let lastVideoTime = -1;
let isProcessing = false;

const createGestureRecognizer = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "/node_modules/@mediapipe/tasks-vision/wasm"
    );
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "/app/shared/models/gesture_recognizer.task",
            delegate: "CPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
    });
    console.log("Gesture recognizer created:", gestureRecognizer);
};

async function enableWebcam() {

    video = document.createElement("video");
    video.id = "webcam-video";
    video.style.display = "none";
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;
    playPromise = video.play();

    video.addEventListener("loadedmetadata", handleHandGesture);

}

async function disableWebcam() {
    if (video && playPromise) {
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        video.pause();
        video.srcObject = null;
        video = null;
        console.log("Webcam disabled");
    }
}

function handleHandGesture() {
    const videoElement = document.getElementById("webcam-video");

    if (!videoElement || !gestureRecognizer) {
        return;
    }

    let nowInMs = Date.now();
    if (videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        result = gestureRecognizer.recognizeForVideo(video, nowInMs);
        console.log("Gesture recognition result:", result);
    }

    window.requestAnimationFrame(handleHandGesture);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type !== 'offscreen') {
        return;
    }

    let response;
    (async () => {
        if (request.action === 'enableWebcamOffscreen') {
            try {
                await createGestureRecognizer();
                await enableWebcam();
                response = 'Webcam enabled in offscreen document and gesture recognizer initialized';
            } catch (error) {
                console.error('Failed to initialize gesture recognizer:', error);
                response = 'Webcam enabled in offscreen document but gesture recognizer failed to initialize';
            }
            sendResponse(response);
        }

        if (request.action === 'disableWebcamOffscreen') {
            try {
                await disableWebcam();
                response = 'Webcam disabled in offscreen document';
            } catch (error) {
                console.error('Failed to disable webcam:', error);
                response = 'Failed to disable webcam: ' + error.message;
            }
            sendResponse(response);
        }
    })();

    return true;
});