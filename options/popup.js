var ext_api = (typeof browser === 'object') ? browser : chrome;

document.addEventListener('DOMContentLoaded', function () {
  const saveMhtmlBtn = document.getElementById('save-mhtml');
  if (saveMhtmlBtn) {
    saveMhtmlBtn.addEventListener('click', function () {
      console.log('Save MHTML button clicked');
      ext_api.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log('Active tab:', tabs[0]);
        ext_api.tabs.sendMessage(tabs[0].id, { action: "saveMHTML" }, function (response) {
          if (ext_api.runtime.lastError) {
            console.error('Error sending message:', ext_api.runtime.lastError);
            alert('Error sending message: ' + ext_api.runtime.lastError.message);
            return;
          }
          if (response && response.mhtmlData) {
            console.log('MHTML data received');
            let blob = new Blob([response.mhtmlData], { type: 'application/x-mimearchive' });
            let url = URL.createObjectURL(blob);
            let filename = tabs[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            filename = filename.split('.')[0] + '.mhtml';
            console.log('Initiating download:', filename);
            ext_api.downloads.download({
              url: url,
              filename: filename,
              saveAs: true,
              conflictAction: 'uniquify'
            }, function (downloadId) {
              if (ext_api.runtime.lastError) {
                console.error('Error initiating download:', ext_api.runtime.lastError);
                alert('Error initiating download: ' + ext_api.runtime.lastError.message);
              } else {
                console.log('Download started with ID:', downloadId);
              }
            });
          } else {
            console.error('No MHTML data received from content script');
            alert('Error: No MHTML data received from content script');
          }
        });
      });
    });
  } else {
    console.error('Save MHTML button not found');
  }
});
