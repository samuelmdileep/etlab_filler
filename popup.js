// --- NEW: Immediately load saved score from memory when popup opens ---
chrome.storage.local.get(['totalQuestionsFilled'], (result) => {
  document.getElementById("count").innerText = result.totalQuestionsFilled || 0;
});

// Listen for real-time count updates sent from the content script
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "UPDATE_COUNT") {
    document.getElementById("count").innerText = request.count;
  }
});

// Attach click listeners to the buttons
document.getElementById("btn-top").addEventListener("click", () => {
  sendCommand("FILL_TOP");
});

document.getElementById("btn-random").addEventListener("click", () => {
  sendCommand("FILL_RANDOM");
});

function sendCommand(actionCommand) {
  const errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "none"; 

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // Safety check: Make sure we are actually on ETLab
    if (activeTab.url && activeTab.url.includes("etlab.in")) {
      chrome.tabs.sendMessage(activeTab.id, { action: actionCommand }, (response) => {
        if (chrome.runtime.lastError) {
          errorMsg.innerText = "❌ Refresh the page first.";
          errorMsg.style.display = "block";
        }
      });
    } else {
      errorMsg.innerText = "❌ Please open an ETLab page.";
      errorMsg.style.display = "block";
    }
  });
}