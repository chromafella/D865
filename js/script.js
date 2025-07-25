// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
  const resultText = document.getElementById("pollResult");
  const choices = ["Corvette", "Tacoma", "Bronco"];

  // ✅ Only apply voting logic to buttons with [data-vote]
  const voteButtons = document.querySelectorAll(".pretty-button[data-vote]");
  voteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const vote = button.dataset.vote;

      if (localStorage.getItem("drive865_voted")) {
        alert("You already voted.");
        return;
      }

      const voteRef = db.ref(`votes/${vote}`);
      voteRef.transaction(current => (current || 0) + 1).then(() => {
        localStorage.setItem("drive865_voted", vote);
        resultText.textContent = `Thanks! You voted for: ${vote}`;
      });
    });
  });

  // ✅ Live Results
  const voteRef = db.ref("votes");
  voteRef.on("value", snapshot => {
    const data = snapshot.val() || {};
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    choices.forEach(choice => {
      const count = data[choice] || 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;

      const bar = document.getElementById(`bar-${choice}`);
      const label = document.getElementById(`percent-${choice}`);

      if (bar) bar.style.width = `${percent}%`;
      if (label) label.textContent = `${percent}%`;
    });

    const resultBox = document.getElementById("results");
    if (resultBox) resultBox.classList.remove("hidden");
  });

  // ✅ Optional: Suggestion Form (Text Input)
  const suggestionForm = document.getElementById("suggestionForm");
  const suggestionInput = document.getElementById("suggestionInput");
  const suggestionResult = document.getElementById("suggestionResult");

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", e => {
      e.preventDefault();
      const suggestion = suggestionInput.value.trim();

      if (!suggestion) return;

      db.ref("carSuggestions").push(suggestion).then(() => {
        suggestionInput.value = "";
        suggestionResult.textContent = "Thanks for your suggestion!";
      });
    });
  }
});
