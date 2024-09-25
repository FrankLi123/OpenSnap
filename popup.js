document.getElementById('archiveBtn').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let url = tabs[0].url;
    let archiveUrl = 'https://archive.is/?run=1&url=' + encodeURIComponent(url);
    chrome.tabs.create({ url: archiveUrl });
  });
});

document.getElementById('save-mhtml').addEventListener('click', function () {
  console.log('Save MHTML button clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('Active tab:', tabs[0]);
    chrome.pageCapture.saveAsMHTML({ tabId: tabs[0].id }, function (mhtmlData) {
      if (chrome.runtime.lastError) {
        console.error('Error saving MHTML:', chrome.runtime.lastError);
        alert('Error saving MHTML: ' + chrome.runtime.lastError.message);
        return;
      }

      console.log('MHTML data received');
      let url = URL.createObjectURL(mhtmlData);
      let filename = tabs[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mhtml';
      console.log('Initiating download:', filename);
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      }, function(downloadId) {
        if (chrome.runtime.lastError) {
          console.error('Error initiating download:', chrome.runtime.lastError);
          alert('Error initiating download: ' + chrome.runtime.lastError.message);
        } else {
          console.log('Download started with ID:', downloadId);
        }
      });

      // Create a FormData object to send the file
      let formData = new FormData();
      formData.append('file', new Blob([mhtmlData], {type: 'application/x-mimearchive'}), filename);
      formData.append('identifier', 'user123'); // Replace with actual user identifier

      // Send the MHTML data to your backend
      fetch('http://localhost:9000/upload/', {
        method: 'POST',
        body: formData
      })
          .then(response => response.json())
          .then(data => {
            console.log('File uploaded successfully:', data);
            alert('File saved successfully. View URL: ' + data.view_url);
          })
          .catch(error => {
            console.error('Error uploading file:', error);
            alert('Error saving file: ' + error.message);
          });

    });
  });
});