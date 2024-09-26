console.log('Content script loaded');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Message received in content script:', request);
    if (request.action === "saveMHTML") {
        try {
            const docType = new XMLSerializer().serializeToString(document.doctype);
            const html = document.documentElement.outerHTML;
            const mhtmlData = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="boundary"

--boundary
Content-Type: text/html; charset=utf-8
Content-Location: ${document.location.href}

${docType}
${html}

--boundary--`;

            console.log('MHTML data generated, sending response');
            sendResponse({ mhtmlData: mhtmlData });
        } catch (error) {
            console.error('Error generating MHTML data:', error);
            sendResponse({ error: error.toString() });
        }
    }
    return true;  // 保持消息通道开放
});