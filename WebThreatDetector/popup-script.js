// Firebase configuration
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

// get a reference to the database service
let messagesRef = firebase.database().ref('Collected Data');

// event listener for when the user makes a report of a potentially malicious URL
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault(); // prevent the page from refreshing

    // Get the current active tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;

        // Create a new object with the URL and the current timestamp
        const data = {
            url: currentUrl,
            timestamp: Date.now()
        };
        // Save the message to the database
        saveMessage(data);
    });
});

// function to save the message to the database
function saveMessage(data) {
    let newMessageRef = messagesRef.push(); // create a new entry in the database
    
    // set the data for the new entry in the database
    newMessageRef.set({
        url: data.url,
        date: data.timestamp,
    });
}

// Event listener for the form submission to show a message to the user that the report was submitted successfully
document.getElementById('contactForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from submitting
    document.getElementById('messageContainer').innerText = 'Thank you, the report was submitted';
});
