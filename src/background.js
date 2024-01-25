chrome.tabs.onUpdated.addListener(function(details) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0].url) {
      const currentUrl = new URL(tabs[0].url);
      // Check if the current URL matches the one you want to filter
      if (
          currentUrl.host === 'web.mashov.info' &&
          currentUrl.pathname.startsWith('/students/main/students/') &&
          currentUrl.pathname.endsWith('/behave')
      ) {
        const key = 'X-Csrf-Token';

        // Use executeScript to get the value from localStorage
        chrome.scripting.executeScript(tabs[0].id, { code: `localStorage['${key}']` }, function (result) {
          // result is an array containing the result of the executed code
          const csrfToken = result[0];
          console.log(csrfToken);

          // Send a message to the content script with the CSRF token
          chrome.tabs.sendMessage(tabs[0].id, { action: 'pageLoaded', url: tabs[0].url, csrfToken: csrfToken });
        });
      }
    }
  });
});
