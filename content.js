// Listen for commands from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_TOP") {
    processAppraisal(true);
    sendResponse({ status: "started" });
  } else if (request.action === "FILL_RANDOM") {
    processAppraisal(false);
    sendResponse({ status: "started" });
  }
  return true; 
});

// Utility function to create a pause/delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processAppraisal(alwaysTop) {
  const radios = document.querySelectorAll("input[type='radio']");
  if (radios.length === 0) {
    console.warn("[ETLab Automator] No radio buttons found on this page.");
    return;
  }

  const groups = {};
  radios.forEach(radio => {
    if (!groups[radio.name]) {
      groups[radio.name] = [];
    }
    groups[radio.name].push(radio);
  });

  const groupNames = Object.keys(groups);
  
  // --- NEW: Fetch the all-time saved count from browser memory ---
  const storageResult = await chrome.storage.local.get(['totalQuestionsFilled']);
  let allTimeCount = storageResult.totalQuestionsFilled || 0;

  for (let i = 0; i < groupNames.length; i++) {
    const groupName = groupNames[i];
    const options = groups[groupName];

    let selectedIndex = 0; 
    
    if (!alwaysTop) {
      selectedIndex = Math.floor(Math.random() * Math.min(3, options.length));
    }

    const targetRadio = options[selectedIndex];

    if (!targetRadio.checked) {
      targetRadio.checked = true;

      targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
      targetRadio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // --- NEW: Add 1 to memory, save it, and update UI ---
      allTimeCount++;
      await chrome.storage.local.set({ totalQuestionsFilled: allTimeCount });
      chrome.runtime.sendMessage({ action: "UPDATE_COUNT", count: allTimeCount });

      const delay = Math.floor(Math.random() * 200) + 150;
      await sleep(delay);
    }
  }
  
  console.log(`[ETLab Automator] Finished. Lifetime questions answered: ${allTimeCount}`);
}