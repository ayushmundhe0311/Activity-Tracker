// Timer state and domain tracking
let currentTabId = null;
let currentDomain = '';
let startTime = 0;
let timeSpent = {};

function startTimer(tabId, domain) {
    if (currentTabId !== tabId) {
        if (currentTabId !== null) {
            updateElapsedTime();  // Update time when switching tabs
        }
        currentTabId = tabId;
        currentDomain = domain;
        startTime = Date.now();
        console.log(`Timer started for ${domain}`);
    }
}

function updateElapsedTime() {
    if (currentDomain) {
        const elapsedTime = Date.now() - startTime;
        timeSpent[currentDomain] = (timeSpent[currentDomain] || 0) + elapsedTime;
        chrome.storage.local.set({timeSpent: timeSpent}, () => {
            console.log(`Updated time for ${currentDomain}: ${timeSpent[currentDomain]} ms`);
        });
    }
}

function stopTimer() {
    updateElapsedTime();  // Final update before stopping
    currentTabId = null;
    currentDomain = '';
    startTime = 0;
    console.log("Timer stopped");
}

// Combined event listeners
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (tab.url) {
            startTimer(activeInfo.tabId, new URL(tab.url).hostname);
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tabId === currentTabId) {
        stopTimer();
        startTimer(tabId, new URL(changeInfo.url).hostname);
    }
});

chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        stopTimer();  // Pause when browser loses focus
    } else {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
            if (tabs.length > 0 && tabs[0].url) {
                startTimer(tabs[0].id, new URL(tabs[0].url).hostname);
            }
        });
    }
});

chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === currentTabId) {
        stopTimer();
    }
});
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({ 'focusModeEnabled': false });
});


// Optional: Use alarms for periodic checks
chrome.alarms.create('timerCheck', { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => {
    if (currentTabId !== null) {
        console.log("Timer check: Timer is active and ticking...");
    }
});
chrome.storage.local.set({timeSpent: timeSpent}, function() {
    if (chrome.runtime.lastError) {
        console.error(`Error saving data: ${chrome.runtime.lastError}`);
    } else {
        console.log(`Updated time for ${currentDomain}: ${timeSpent[currentDomain]} ms`);
    }
});
