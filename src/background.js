chrome.tabs.onUpdated.addListener(function(details) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url) {
      const currentUrl = new URL(tabs[0].url);

      // Check if the current URL matches the one you want to filter
      const isTargetUrl = (
          currentUrl.host === 'web.mashov.info' &&
          currentUrl.pathname.startsWith('/students/main/students/') &&
          currentUrl.pathname.endsWith('/behave')
      );

      if (isTargetUrl) {
        // Execute script to get localStorage data
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => JSON.stringify(localStorage),
        }, (injectionResults) => {
          const storageResponse = injectionResults[0].result;
          const localStorageData = JSON.parse(storageResponse);

          // Extract CSRF token from localStorage
          const csrfToken = localStorageData['X-Csrf-Token'];

          // Send a message to the content script with the CSRF token
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'pageLoaded',
            url: tabs[0].url,
            csrfToken: csrfToken,
          });
        });
      }
    }
  });
});