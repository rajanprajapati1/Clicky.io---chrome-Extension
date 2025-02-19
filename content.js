

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "NEW_MESSAGE") {
        console.log("📩 Message received in content script:", request.message);
    }
});
