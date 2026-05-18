// Load saved count and autopilot state when menu opens
chrome.storage.local.get(['totalQuestionsFilled', 'autopilot'], (result) => {
  document.getElementById("count").innerText = result.totalQuestionsFilled || 0;
  
  if (result.autopilot) {
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

// --- THE SECURE MASTER CONTROL FUNCTION ---
function triggerAction(actionName, autoMode = null) {
  const errorMsg = document.getElementById("error-msg");
  errorMsg.style.display = "none"; 

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    // STRICT CHECK: Are we actually on an ETLab tab?
    if (activeTab.url && activeTab.url.includes("etlab.in")) {
      
      // If it's an Autopilot command, save to memory ONLY because we passed the URL check
      if (autoMode) {
        chrome.storage.local.set({ autopilot: true, autoMode: autoMode }, () => {
          chrome.tabs.sendMessage(activeTab.id, { action: actionName });
          window.close(); // Close menu to let the bot take over
        });
      } 
      // If it's a Single Page command, just send it without touching memory
      else {
        chrome.tabs.sendMessage(activeTab.id, { action: actionName }, (response) => {
          if (chrome.runtime.lastError) {
            errorMsg.innerText = "❌ Please refresh the ETLab page first.";
            errorMsg.style.display = "block";
            errorMsg.style.color = "#d32f2f";
            errorMsg.style.background = "#ffebee";
          }
        });
      }
      
    } else {
      // NOT ON ETLAB: Block everything. Do NOT save to memory. Show error.
      errorMsg.innerText = "❌ Please open an ETLab page to use this tool.";
      errorMsg.style.display = "block";
      errorMsg.style.color = "#d32f2f";
      errorMsg.style.background = "#ffebee";
    }
  });
}

// Connect Single Page Buttons
document.getElementById("btn-page-top").addEventListener("click", () => triggerAction("FILL_TOP"));
document.getElementById("btn-page-random").addEventListener("click", () => triggerAction("FILL_RANDOM"));
document.getElementById("btn-page-worst").addEventListener("click", () => triggerAction("FILL_WORST"));

// Connect Autopilot Buttons
document.getElementById("btn-auto-top").addEventListener("click", () => triggerAction("START_AUTOPILOT", "top"));
document.getElementById("btn-auto-random").addEventListener("click", () => triggerAction("START_AUTOPILOT", "random"));
document.getElementById("btn-auto-worst").addEventListener("click", () => triggerAction("START_AUTOPILOT", "worst"));

// Stop Trigger (Always allowed to run so you can kill it from anywhere)
document.getElementById("btn-stop").addEventListener("click", async () => {
  await chrome.storage.local.set({ autopilot: false });
  window.close();
});