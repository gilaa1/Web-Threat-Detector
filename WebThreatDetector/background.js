//firebase configuration
require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY, 
    authDomain: "threatdetect-16bdf.firebaseapp.com",
    databaseURL: "https://threatdetect-16bdf-default-rtdb.firebaseio.com",
    projectId: "threatdetect-16bdf",
    storageBucket: "threatdetect-16bdf.appspot.com",
    messagingSenderId: "776380842813",
    appId: "1:776380842813:web:e2cb334e6fe2e2f616fb54"
};

// Initialize Firebase (using the configuration above)
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database(); //get the realtime database service
const collectedDataRef = database.ref('Collected Data'); 

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { //event listener for tab update that is triggered when a tab is updated
    // Check if the URL has changed
    if (changeInfo.url) { 
        const apiKey = process.env.FIREBASE_API_KEY; //Google API key for accessing the Google Safe Browsing API
        const apiUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' + apiKey; //Google Safe Browsing API URL for checking the URL safet
        // Request body for Google Safe Browsing API
        const requestBody = {  
            //client information
            client: {
                clientId: "safe-browse-url-lookup", //client ID (arbitrary string)
                clientVersion: "1.5.2" 
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"], //types of threats to check for- malware and phishing
                platformTypes: ["ANY_PLATFORM"], //platforms to check for 
                threatEntries: [
                    { url: changeInfo.url } //URL to check for threats
                ]
            }
        };

        // Check Google Safe Browsing API for entries by sending a POST request
        fetch(apiUrl, { 
            method: 'POST',
            body: JSON.stringify(requestBody), //convert the request body to JSON
            headers: {
                'Content-Type': 'application/json' //specify the content type as JSON
            }
        })
        .then(response => response.json()) //parse the response to JSON
        .then(data => { 
            // Check if the URL is malicious
            if (data.matches && data.matches.length > 0) {
                notifyUser("Beware! The URL you are trying to access is malicious. Please do not proceed further. URL: " + changeInfo.url);
            }
        })
        .catch(error => {
            //notify the user if an error occurs while checking the URL for threats
            console.error('Error:', error);
            notifyUser("Error occurred while checking the URL.");
        });

        // Check if the URL has been reported multiple times as potentially malicious
        collectedDataRef.orderByChild('url').equalTo(changeInfo.url).once('value', snapshot => {
            // Get the number of reports for the URL
            let count = 0;
            snapshot.forEach(childSnapshot => {
                count++;
            });
            // Notify the user if the URL has been reported 5 times or more
            if (count >= 5) {
                notifyUser("Warning: This URL has been reported multiple times as potentially malicious. URL: " + changeInfo.url);
            }
        });
    }
});


// Function to show an alert
function notifyUser(message) {
    alert(message);
}
 