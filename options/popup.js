var ext_api = (typeof browser === 'object') ? browser : chrome;

document.addEventListener('DOMContentLoaded', function () {
  const saveMhtmlBtn = document.getElementById('save-mhtml');
  if (saveMhtmlBtn) {
    saveMhtmlBtn.addEventListener('click', function () {
      console.log('Save MHTML button clicked');
      ext_api.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          console.log('Active tab:', tabs[0]);
          ext_api.pageCapture.saveAsMHTML({ tabId: tabs[0].id }, function (mhtmlData) {
            if (ext_api.runtime.lastError) {
              console.error('Error capturing MHTML:', ext_api.runtime.lastError);
              alert('Error capturing MHTML: ' + ext_api.runtime.lastError.message);
              return;
            }
            console.log('MHTML data captured');
            let filename = tabs[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            filename = filename.split('.')[0] + '.mhtml';
            console.log('Initiating download:', filename);
            ext_api.downloads.download({
              url: URL.createObjectURL(mhtmlData),
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
          });
        } else {
          console.error('No active tab found');
          alert('Error: No active tab found');
        }
      });
    });
  } else {
    console.error('Save MHTML button not found');
  }
});
