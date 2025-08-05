const grantButton = document.getElementById('grant-camera-button');
const statusDiv = document.getElementById('status');

grantButton.addEventListener('click', async () => {
    try {
        statusDiv.textContent = 'Requesting camera access...';
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        statusDiv.textContent = 'Permission granted! You can now close this page and use the extension popup.';
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.error('Error:', err);
        statusDiv.textContent = 'Error: Permission denied or failed.';
    }
});