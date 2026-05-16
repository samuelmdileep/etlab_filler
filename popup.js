// Load saved count and autopilot state when menu opens
chrome.storage.local.get(['totalQuestionsFilled', 'autopilot'], (result) => {
  document.getElementById("count").innerText = result.totalQuestionsFilled || 0;
  
  if (result.autopilot) {
    // Hide the action buttons and helper notice, show the stop button
    document.getElementById("action-content").style.display = "none";
    document.getElementById("helper-notice").style.display = "none";
    document.getElementById("btn-stop").style.display = "block";
    
    const errorMsg = document.getElementById("error-msg");
    errorMsg.innerText = "⚙️ Autopilot is currently running...";
    errorMsg.style.display = "block";
    errorMsg.style.color = "#003087";
    errorMsg.style.background = "#E1F5FE";
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "UPDATE_COUNT") {
    document.getElementById("count").innerText = request.count;
  }
});

// Current Page Manual Triggers
document.getElementById("btn-page-top").addEventListener("click", () => sendCommand("FILL_TOP"));
document.getElementById("btn-page-random").addEventListener("click", () => sendCommand("FILL_RANDOM"));

// Dual Autopilot Triggers
document.getElementById("btn-auto-top").addEventListener("click", async () => {
  await chrome.storage.local.set({ autopilot: true, autoMode: 'top' });
  sendCommand("START_AUTOPILOT");
  window.close(); 
});

document.getElementById("btn-auto-random").addEventListener("click", async () => {
  await chrome.storage.local.set({ autopilot: true, autoMode: 'random' });
  sendCommand("START_AUTOPILOT");
  window.close(); 
});

// Stop Trigger
document.getElementById("btn-stop").addEventListener("click", async () => {
  await chrome.storage.local.set({ autopilot: false });
  window.close();
});

function sendCommand(actionCommand) {
  const errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "none"; 

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Check if the user is actually on the ETLab domain
    if (activeTab.url && activeTab.url.includes("etlab.in")) {
      chrome.tabs.sendMessage(activeTab.id, { action: actionCommand }, (response) => {
        if (chrome.runtime.lastError) {
          errorMsg.innerText = "❌ Please refresh the ETLab page first.";
          errorMsg.style.display = "block";
          errorMsg.style.color = "#d32f2f";
          errorMsg.style.background = "#ffebee";
        }
      });
    } else {
      errorMsg.innerText = "❌ Please open an ETLab page to use this tool.";
      errorMsg.style.display = "block";
      errorMsg.style.color = "#d32f2f";
      errorMsg.style.background = "#ffebee";
    }
  });
}