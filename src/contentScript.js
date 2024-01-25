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
                        const isButtonDisabled = isButtonDisabledInItem(item);


                        // Check if there is a matching justification in the list
                        const justificationMatch = justificationList.some(justification => {
                            const justificationStartDate = justification.startDate ? new Date(justification.startDate).toLocaleDateString() : null;
                            const justificationStartLesson = justification.startLesson;

                            return (
                                itemDate &&
                                justificationStartDate === itemDate.toLocaleDateString() &&
                                justificationStartLesson === itemClassHour
                            );
                        });

                        console.log('Item:', item);
                        console.log('Justification Match:', justificationMatch);
                        console.log('Button Disabled:', isButtonDisabled);
                        console.log('---');


                        // If there is a match, hide the item
                        if (justificationMatch ||
                            isButtonDisabled) {
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
                     if (!Array.isArray(justificationList)){
                         return;
                     }

                    // Call hideListItems with the justification data
                    hideListItems(justificationList);

                    // Add event listener for window resize
                    window.addEventListener('resize', function () {
                        hideListItems(justificationList);
                    });

                    // Add event listener for window scroll with debouncing
                    let scrollTimeout;
                    window.addEventListener('scroll', function () {
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(function () {
                            hideListItems(justificationList);
                        }, 200); // Adjust the timeout as needed
                    });
                });
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

// Function to extract the date from an HTML list item
function extractDateFromItem(item) {
    const dateElement = item.querySelector('[fxlayoutalign="end center"]');
    if (dateElement) {
        const dateMatch = dateElement.textContent.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch && dateMatch[1]) {
            const [day, month, year] = dateMatch[1].split('/');
            return new Date(`${year}-${month}-${day}`);
        }
    }
    return null;
}

// Function to extract the class hour from an HTML list item
function extractClassHourFromItem(item) {
    const dateElement = item.querySelector('[fxlayoutalign="end center"]');
    if (dateElement) {
        const classHourMatch = dateElement.textContent.match(/שיעור (\d+)/);
        if (classHourMatch && classHourMatch[1]) {
            return parseInt(classHourMatch[1], 10);
        }
    }
    return null;
}

function isButtonDisabledInItem(item) {
    const button = item.querySelector('span > span > div > div.ng-star-inserted > button'); // Assuming the button is a direct child
    const disabled = !button.disabled;
    return button && disabled;
}
