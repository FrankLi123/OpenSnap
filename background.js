chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: bypassPaywall,
    });
});

function bypassPaywall() {
    const url = window.location.href;
    const bypassUrl = `http://35.209.74.136:9023/${url}`;
    window.location.href = bypassUrl;
}
