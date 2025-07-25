// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCT_GUJ64YUlJCHiLU-yQVNd-GMhNbdelo",
  authDomain: "drive865-de742.firebaseapp.com",
  databaseURL: "https://drive865-de742-default-rtdb.firebaseio.com",
  projectId: "drive865-de742",
  storageBucket: "drive865-de742.appspot.com",
  messagingSenderId: "695645566102",
  appId: "1:695645566102:web:bc9365478bc56759aefeb7",
  measurementId: "G-301ZWF6QK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Poll form elements
const pollForm = document.getElementById("pollForm");
const suggestionInput = document.getElementById("suggestionInput");
const pollResult = document.getElementById("pollResult");

// Event listener for poll submission
pollForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const suggestion = suggestionInput.value.trim();

  if (!suggestion) {
    pollResult.textContent = "Please enter a car suggestion.";
    pollResult.classList.remove("hidden");
    return;
  }

  // Check if already submitted
  const hasVoted = localStorage.getItem("hasVotedPoll");
  if (hasVoted) {
    pollResult.textContent = "Sorry, you've already submitted a suggestion.";
    pollResult.classList.remove("hidden");
    return;
  }

  // Save suggestion to Firebase
  const pollRef = ref(database, "pollSuggestions");
  push(pollRef, { suggestion });

  // Set local flag
  localStorage.setItem("hasVotedPoll", "true");

  // UI feedback
  pollForm.reset();
  pollResult.textContent = "Thank you! Your suggestion has been recorded.";
  pollResult.classList.remove("hidden");
});

import { onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const ticker = document.getElementById("ticker-text");

function updateTickerText(suggestions) {
  if (!suggestions || Object.keys(suggestions).length === 0) {
    ticker.textContent = "No suggestions yet. Be the first to submit one!";
    return;
  }

  const entries = Object.values(suggestions);
  const text = entries.map(entry => `🚘 ${entry.suggestion}`).join(" — ");
  ticker.textContent = text;
}

// Realtime updates
const pollRef = ref(database, "pollSuggestions");
onValue(pollRef, (snapshot) => {
  const data = snapshot.val();
  updateTickerText(data);
});
