document.addEventListener('DOMContentLoaded', function() {
    var focusModeToggle = document.getElementById('focusModeToggle');

    // Check the stored state of focus mode and update the toggle accordingly
    chrome.storage.sync.get('focusModeEnabled', function(data) {
        focusModeToggle.checked = data.focusModeEnabled || false;
    });

    // Add event listener to handle changes in focus mode toggle
    focusModeToggle.addEventListener('change', function() {
        if (focusModeToggle.checked) {
            // Set focus mode enabled state in Chrome storage
            chrome.storage.sync.set({ 'focusModeEnabled': true });
        } else {
            // Set focus mode disabled state in Chrome storage
            chrome.storage.sync.set({ 'focusModeEnabled': false });
        }
    });

    // Display time spent data
    chrome.storage.local.get(['timeSpent'], function(result) {
        const timeData = result.timeSpent || {};
        const displayDiv = document.getElementById('timeSpentDisplay');

        Object.keys(timeData).forEach(domain => {
            const timeString = millisToHoursMinutesSeconds(timeData[domain]);
            const siteElement = document.createElement('p');
            siteElement.textContent = `${domain}: ${timeString}`;
            displayDiv.appendChild(siteElement);
        });
    });
});

function millisToHoursMinutesSeconds(millis) {
    const hours = Math.floor(millis / 3600000); // 1 Hour = 3600000 Milliseconds
    const minutes = Math.floor((millis % 3600000) / 60000); // 1 Minute = 60000 Milliseconds
    const seconds = ((millis % 60000) / 1000).toFixed(0); // 1 Second = 1000 Milliseconds
    return `${padTo2Digits(hours)}h ${padTo2Digits(minutes)}m ${padTo2Digits(seconds)}s`;
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
