document.addEventListener('DOMContentLoaded', async () => {
    const enableWebcamButton = document.getElementById('enable-webcam-button');
    const disableWebcamButton = document.getElementById('disable-webcam-button');
    const statusDiv = document.getElementById('status');

    if (!enableWebcamButton || !disableWebcamButton || !statusDiv) {
        alert('DOM elements not found');
        return;
    } else {
        console.log('DOM elements found successfully');
    }

    enableWebcamButton.addEventListener('click', () => {
        try {
            chrome.runtime.sendMessage({
                type: 'background',
                action: 'enableWebcamBackground'
            }, (response) => {
                if (response && response.active === true) {
                    statusDiv.textContent = response.message || 'Webcam enabled';
                } else {
                    statusDiv.textContent = 'Enable webcam failed';
                }
            });
        } catch (error) {
            console.error('Error enabling webcam:', error);
            statusDiv.textContent = 'Error enabling webcam';
        }
    });

    disableWebcamButton.addEventListener('click', () => {
        try {
            chrome.runtime.sendMessage({
                type: 'background',
                action: 'disableWebcamBackground'
            }, (response) => {
                if (response && response.active === false) {
                    statusDiv.textContent = response.message || 'Webcam disabled';
                } else {
                    statusDiv.textContent = 'Failed to disable webcam';
                }
            });
        } catch (error) {
            console.error('Error disabling webcam:', error);
            statusDiv.textContent = 'Error disabling webcam';
        }
    });

});