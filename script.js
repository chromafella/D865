// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Your Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCT_GUJ64YUlJCHiLU-yQVNd-GMhNbdelo",
  authDomain: "drive865-de742.firebaseapp.com",
  databaseURL: "https://drive865-de742-default-rtdb.firebaseio.com",
  projectId: "drive865-de742",
  storageBucket: "drive865-de742.firebasestorage.app",
  messagingSenderId: "695645566102",
  appId: "1:695645566102:web:bc9365478bc56759aefeb7",
  measurementId: "G-301ZWF6QK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM elements
const input = document.getElementById("suggestionInput");
const submitBtn = document.getElementById("submitSuggestion");
const result = document.getElementById("suggestionResult");
const ticker = document.getElementById("ticker-text");

// Submit suggestion to Firebase
if (submitBtn) {
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const suggestion = input.value.trim();
    if (suggestion === "") {
      result.textContent = "Please enter a suggestion.";
      return;
    }

    const suggestionRef = ref(database, "pollSuggestions");
    push(suggestionRef, {
      suggestion: suggestion,
      timestamp: Date.now()
    });

    result.textContent = "Thanks for your suggestion!";
    input.value = "";
  });
}

// Listen for live updates to suggestions
function updateTickerText(data) {
  if (!data) {
    ticker.textContent = "No suggestions yet. Be the first!";
    return;
  }

  const entries = Object.values(data);
  const text = entries.map(entry => `🚗 ${entry.suggestion}`).join(" — ");
  ticker.textContent = text;
}

const pollRef = ref(database, "pollSuggestions");
onValue(pollRef, (snapshot) => {
  const data = snapshot.val();
  updateTickerText(data);
});

document.getElementById("suggestionForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const suggestion = input.value.trim();
  if (suggestion === "") {
    result.textContent = "Please enter a suggestion.";
    return;
  }

  const suggestionRef = ref(database, "pollSuggestions");
  push(suggestionRef, {
    suggestion: suggestion,
    timestamp: Date.now()
  });

  result.textContent = "Thanks for your suggestion!";
  input.value = "";
});

