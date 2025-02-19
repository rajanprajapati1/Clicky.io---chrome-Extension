

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Set up an alarm to wake up the service worker every 30 seconds
chrome.alarms.create("keep_alive", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keep_alive") {
    console.log("⏰ Service worker woke up!");
  }
});

const firebaseConfig = {

};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// ✅ Function to Send Messages
async function sendMessage(sender, receiver, text) {
  try {
    await addDoc(messagesRef, {
      sender,
      receiver,
      message: text,
      timestamp: new Date()
    });
    console.log("✅ Message Sent:", text);
  } catch (error) {
    console.error("❌ Error Sending Message:", error);
  }
}

// ✅ Function to Listen for Messages
function listenForMessages() {
  const q = query(messagesRef, orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    console.log("📩 New Messages:", messages);

    if (messages.length > 0) {
      const latestMessage = messages[0];
       chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (msg) => 
              {
                console.log("📩 Message in tab:", msg);
              document.body.style.backgroundColor = "skyblue"; 
              const btn = document.querySelector("button"); 
              const btn1 = document.getElementById("clear-query-button");
              const sendButton = document.querySelector('[data-testid="send-button"]');

              if (sendButton) {
                sendButton.click();
                console.log("✅ Clicked button!");
              } else {
                console.log("❌ No button found.");
              }
              },
            args: [latestMessage]
          });
        }
      });

      // ✅ Send message to popup.js
      chrome.runtime.sendMessage({ type: "NEW_MESSAGES", messages });
    }
  });
}

// 🔹 Start listening
listenForMessages();

// 🔹 Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "SEND_MESSAGE") {
    sendMessage(request.sender, request.receiver, request.message);
  }
});

