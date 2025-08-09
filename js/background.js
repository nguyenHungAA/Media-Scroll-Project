chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type !== 'background') {
        return;
    }

    if (request.action === 'enableWebcamBackground') {
        console.log('Enabling webcam in background script');

        (async () => {
            try {
                const response = await sendMessageToOffscreenDocument('offscreen', 'enableWebcamOffscreen');
                console.log('Received response:', response);
                sendResponse({ active: true, message: response || 'Webcam enabled in background script' });
            } catch (error) {
                console.error('Error enabling webcam:', error);
                sendResponse({ active: false, error: 'Failed to enable webcam: ' + error.message });
            }
        })();

        return true; // Keep message channel open for async response
    }

    if (request.action === 'disableWebcamBackground') {
        console.log('Disabling webcam in background script');

        (async () => {
            try {
                const response = await sendMessageToOffscreenDocument('offscreen', 'disableWebcamOffscreen');
                sendResponse({ active: false, message: response || 'Webcam disabled in background script' });
            } catch (error) {
                console.error('Error disabling webcam:', error);
                sendResponse({ active: false, error: 'Failed to disable webcam: ' + error.message });
            }
        })();

        return true;
    }
});

async function sendMessageToOffscreenDocument(type = 'offscreen', action) {
    if (!(await hasDocument())) {
        await chrome.offscreen.createDocument({
            url: '/offscreen.html',
            reasons: ['USER_MEDIA'],
            justification: 'Enabling webcam for gesture recognition'
        });
    }

    // Return a Promise that resolves with the response
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: type,
            action: action
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log('Response from offscreen document:', response);
                resolve(response);
            }
        });
    });
}

async function hasDocument() {
    try {
        const matchedClients = await clients.matchAll();
        for (const client of matchedClients) {
            if (client.url.endsWith('/offscreen.html')) {
                return true;
            }
        }
        return false;
    } catch (error) {
        // Fallback: check if offscreen document exists using chrome.offscreen API
        try {
            await chrome.offscreen.createDocument({
                url: '/offscreen.html',
                reasons: ['USER_MEDIA'],
                justification: 'Enabling webcam for gesture recognition'
            });
            return false; // Document was created, so it didn't exist before
        } catch (createError) {
            return true; // Document already exists
        }
    }
}