let language = 'url(flags/english.png)';
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ language });
    console.log(`Default background language set to ${language}`);
})