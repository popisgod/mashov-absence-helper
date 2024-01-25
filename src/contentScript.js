(() => {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'pageLoaded') {
      // Handle the message indicating that the page has loaded
      console.log('Page has loaded!', request.url);

      const currentUrl = new URL(request.url);
      // Extract student ID from the URL
      const pathParts = currentUrl.pathname.split('/');
      const studentId = pathParts[4];


      // Construct the URL with the dynamic student ID
      const fetchUrl = `https://web.mashov.info/api/students/${studentId}/justificationRequests`;


      // Make a fetch request to the different URL using the same credentials
      fetch(fetchUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Csrf-Token': request.csrfToken
        },
      })
          .then(response => response.text())
          .then(data => {
            // Process the fetched data and filter the current page
            console.log(data);
            // Add your filtering logic here
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
    }
  });
})();

