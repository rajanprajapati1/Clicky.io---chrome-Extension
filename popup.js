document.addEventListener("DOMContentLoaded", () => {
    const messagesDiv = document.getElementById("messages");

    // Listen for messages
    chrome.runtime.onMessage.addListener((request) => {
        if (request.type === "NEW_MESSAGE") {
            console.log("📩 Message received in popup:", request.message);
            const p = document.createElement("p");
            p.textContent = request.message.text;
            messagesDiv.appendChild(p);
        }
    });
});
