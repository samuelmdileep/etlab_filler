// --- 1. WAKE UP ON PAGE LOAD ---
window.addEventListener('load', async () => {
  // STRICT DOMAIN CHECK: Instantly kill the script if it's not on ETLab
  if (!window.location.href.includes("etlab.in")) {
    return; 
  }

  const { autopilot } = await chrome.storage.local.get(['autopilot']);
  if (autopilot) {
    console.log("[ETLab Assistant] Autopilot ACTIVE. Taking control in 1.5 seconds...");
    setTimeout(executeAutopilotStep, 1500); 
  }
});

// --- 2. LISTEN FOR MANUAL COMMANDS ---
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "FILL_TOP") processAppraisal('top');
  if (request.action === "FILL_RANDOM") processAppraisal('random');
  if (request.action === "FILL_WORST") processAppraisal('worst'); 
  if (request.action === "START_AUTOPILOT") executeAutopilotStep();
  sendResponse({ status: "started" });
  return true; 
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- 3. THE AUTOPILOT BRAIN ---
async function executeAutopilotStep() {
  const state = await chrome.storage.local.get(['autopilot', 'autoMode']);
  if (!state.autopilot) return; 
  
  // SCENARIO A: We are on the Subject List Dashboard
  const subjectTable = document.querySelector('table.section');
  if (subjectTable) {
    console.log("[ETLab Assistant] Dashboard detected. Scanning page for uncompleted surveys...");
    
    const forms = document.querySelectorAll('form#section-form');
    const rows = subjectTable.querySelectorAll('tbody tr');
    let foundUncompletedForm = null;

    // We loop through the rows and forms
    for (let i = 0; i < Math.min(forms.length, rows.length); i++) {
      // Grab both the text AND the raw HTML, forced to lowercase for safety
      let rowText = (rows[i].textContent || "").toLowerCase();
      let rowHTML = (rows[i].innerHTML || "").toLowerCase();

      // STRICT CHECK: Does it have the word 'completed' OR the green success checkmark?
      let isAlreadyCompleted = rowText.includes('completed') || rowHTML.includes('success.png');

      if (!isAlreadyCompleted) {
        if (forms[i]) {
          foundUncompletedForm = forms[i];
          break; 
        }
      }
    }

    if (foundUncompletedForm) {
      console.log("[ETLab Assistant] Uncompleted survey found! Opening it now...");
      foundUncompletedForm.submit(); 
    } else {
      console.log("[ETLab Assistant] All surveys are completed on this page.");
      await chrome.storage.local.set({ autopilot: false });
      alert("✅ ETLab Auto Assistant: All surveys are fully completed!");
    }
    return;
  }

  // SCENARIO B: We are on an actual Survey Page
  const radios = document.querySelectorAll("input[type='radio']");
  if (radios.length > 0) {
    console.log(`[ETLab Assistant] Survey detected. Mode: ${state.autoMode}`);
    
    // Pass the saved mode into the engine
    await processAppraisal(state.autoMode || 'top'); 
    
    console.log("[ETLab Assistant] Survey filled. Clicking final Submit...");
    await sleep(500); 

    const finalSubmitBtn = document.querySelector('button[type="submit"], input[type="submit"], .btn-success');
    if (finalSubmitBtn) {
      finalSubmitBtn.click();
    } else {
      console.error("[ETLab Assistant] CRITICAL: Could not find the final Submit button. Pausing autopilot.");
      await chrome.storage.local.set({ autopilot: false });
      alert("⚠️ Autofill finished, but could not find the submit button. Autopilot paused.");
    }
    return;
  } else {
    // Failsafe: We are on a page that we thought was a survey, but there are no radio buttons
    console.error("[ETLab Assistant] CRITICAL: No radio buttons found. Pausing autopilot.");
    await chrome.storage.local.set({ autopilot: false });
  }
}

// --- 4. THE CORE FILLING ENGINE ---
async function processAppraisal(mode) {
  const radios = document.querySelectorAll("input[type='radio']");
  if (radios.length === 0) return;

  const groups = {};
  radios.forEach(radio => {
    if (!groups[radio.name]) groups[radio.name] = [];
    groups[radio.name].push(radio);
  });

  const groupNames = Object.keys(groups);
  const storageResult = await chrome.storage.local.get(['totalQuestionsFilled']);
  let allTimeCount = storageResult.totalQuestionsFilled || 0;

  for (let i = 0; i < groupNames.length; i++) {
    const options = groups[groupNames[i]];
    let selectedIndex = 0; 
    
    // Logic router for the 3 different modes
    if (mode === 'worst') {
      selectedIndex = options.length - 1; // Always picks the very last option
    } else if (mode === 'random') {
      selectedIndex = Math.floor(Math.random() * Math.min(3, options.length)); // Top 3 random
    } else {
      selectedIndex = 0; // Top (default)
    }

    const targetRadio = options[selectedIndex];

    if (!targetRadio.checked) {
      targetRadio.checked = true;
      targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
      targetRadio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      allTimeCount++;
      chrome.runtime.sendMessage({ action: "UPDATE_COUNT", count: allTimeCount });

      const delay = Math.floor(Math.random() * 200) + 150;
      await sleep(delay);
    }
  }
  
  await chrome.storage.local.set({ totalQuestionsFilled: allTimeCount });
  console.log(`[ETLab Assistant] Form processed in ${mode} mode.`);
}