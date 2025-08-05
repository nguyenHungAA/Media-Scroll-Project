// Wait for DOM and scripts to load
document.addEventListener('DOMContentLoaded', async () => {
    const enableWebcamButton = document.getElementById('enable-webcam-button');
    const disableWebcamButton = document.getElementById('disable-webcam-button');
    const statusDiv = document.getElementById('status');

    if (!enableWebcamButton || !disableWebcamButton || !statusDiv) {
        console.error('DOM elements not found');
        return;
    }

    let webcamRunning = false;
    let webcam = null;
    let model = null;

    try {
        if (typeof handTrack === 'undefined') {
            statusDiv.textContent = 'Error: Handtrack.js not loaded';
            return;
        }
        statusDiv.textContent = 'Loading model...';
        const modelParams = {
            flipHorizontal: true,
            maxNumBoxes: 1,
            iouThreshold: 0.5,
            scoreThreshold: 0.7,
        };
        model = await handTrack.load(modelParams);
        statusDiv.textContent = 'Ready to use!';
        enableWebcamButton.disabled = false;

    } catch (error) {
        console.error('Error loading model:', error);
        statusDiv.textContent = 'Error: Failed to load model';
        return;
    }

    async function checkCameraPermission() {
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            return permission.state; // 'granted', 'denied', or 'prompt'
        } catch (err) {
            console.error('Permission query error:', err);
            return 'unknown';
        }
    }

    async function enableWebcam() {
        if (webcamRunning || !model) return;

        const permissionState = await checkCameraPermission();

        if (permissionState === 'prompt') {
            statusDiv.textContent = 'Camera permission needed. Opening options page...';
            chrome.runtime.openOptionsPage();
            return;
        } else if (permissionState === 'denied') {
            statusDiv.textContent = 'Camera permission denied. Check browser settings.';
            return;
        }

        // Proceed if 'granted' or 'unknown' (fallback)
        try {
            statusDiv.textContent = 'Requesting camera access...';

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            webcam = document.createElement('video');
            webcam.autoplay = true;
            webcam.playsInline = true;
            webcam.muted = true;
            webcam.style.display = 'none';
            document.body.appendChild(webcam);
            console.log('Webcam stream:', stream);

            webcam.srcObject = stream;
            webcamRunning = true;
            // 
            webcam.addEventListener('loadeddata', () => {
                statusDiv.textContent = 'Camera active - detecting hands';
                startHandTracking();
                updateButtonStates();

                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: 'cameraStatus', active: true });
                    }
                });
            });
        } catch (err) {
            console.error('Error accessing webcam:', err);
            statusDiv.textContent = 'Error: Camera access denied';
        }
    }

    // [The rest of your code for disableWebcam, startHandTracking, detectHands, updateButtonStates remains unchanged]

    enableWebcamButton.addEventListener('click', enableWebcam);
    disableWebcamButton.addEventListener('click', disableWebcam);

});