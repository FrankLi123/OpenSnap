document.addEventListener('DOMContentLoaded', function () {
    const actionButtons = document.getElementById('actionButtons');
    const bypassButton = document.getElementById('bypassButton');
    const archiveButton = document.getElementById('archiveButton');
    const viewArchivesButton = document.getElementById('viewArchivesButton');

    chrome.storage.local.get(['userId'], function (result) {
        if (!result.userId) {
            const userId = generateUserId();
            chrome.storage.local.set({ userId: userId }, function () {
                console.log('User ID generated and saved');
            });
        }
        actionButtons.style.display = 'block';
    });

    bypassButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: bypassPaywall,
        });
    });

    archiveButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.storage.local.get(['userId'], async function (result) {
            const response = await fetch('http://localhost:5000/archive', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': result.userId,
                },
                body: JSON.stringify({ url: tab.url }),
            });

            if (response.ok) {
                alert('Page archived successfully!');
            } else {
                alert('Failed to archive page. Please try again.');
            }
        });
    });

    viewArchivesButton.addEventListener('click', () => {
        chrome.storage.local.get(['userId'], function (result) {
            chrome.tabs.create({ url: `http://localhost:5000/my-archives/${result.userId}` });
        });
    });
});

function bypassPaywall() {
    const url = window.location.href;
    const bypassUrl = `http://35.209.74.136:9023/${url}`;
    window.location.href = bypassUrl;
}

function generateUserId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}