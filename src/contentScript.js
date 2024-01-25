(() => {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'pageLoaded') {
            // Handle the message indicating that the page has loaded
            console.log('Page has loaded!', request.url);

            const currentUrl = new URL(request.url);
            // Extract student ID from the URL
            const pathParts = currentUrl.pathname.split('/');
            const studentId = pathParts[4];

            // Construct the URL with the dynamic student ID
            const fetchUrl = `https://web.mashov.info/api/students/${studentId}/justificationRequests`;

            // Function to hide list items
            function hideListItems(justificationList) {
                waitForElements('mat-list-item', function (elements) {
                    // Iterate over the list items
                    elements.forEach(item => {
                        const itemDate = extractDateFromItem(item); // Implement this function
                        const itemClassHour = extractClassHourFromItem(item); // Implement this function

                        // Check if there is a matching justification in the list
                        const justificationMatch = justificationList.some(justification => {
                            const justificationStartDate = new Date(justification.startDate).toLocaleDateString();
                            const justificationStartLesson = justification.startLesson;

                            return (
                                justificationStartDate === itemDate.toLocaleDateString() &&
                                justificationStartLesson === itemClassHour
                            );
                        });

                        // If there is a match, hide the item
                        if (justificationMatch) {
                            item.remove()
                        }
                    });
                    console.log('finished');

                });
            }


            // Make a fetch request to the different URL using the same credentials
            fetch(fetchUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Csrf-Token': request.csrfToken
                },
            })
                .then(response => response.json())
                .then(justificationList => {
                    // Convert the justification data to a list
                    justificationList = Array.isArray(justificationList) ? justificationList : [];

                    // Call hideListItems with the justification data
                    hideListItems(justificationList);
                });

            // Add event listener for window resize
            window.addEventListener('resize', hideListItems);

            // Add event listener for window scroll
            window.addEventListener('scroll', hideListItems);
        }
    });
})();

function waitForElements(selector, callback) {
    const intervalId = setInterval(function () {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            clearInterval(intervalId);
            callback(elements);
        }
    }, 0); // adjust the interval as needed
}
