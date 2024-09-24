document.addEventListener('DOMContentLoaded', function() {
  const bypassButton = document.getElementById('bypassButton');
  
  bypassButton.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: bypassPaywall,
    });
  });
});

function bypassPaywall() {
  // 这个函数将在目标页面中执行
  const url = window.location.href;
  const bypassUrl = `http://35.209.74.136:9023/${url}`;
  window.location.href = bypassUrl;
}