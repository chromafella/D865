import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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
const db = getDatabase(app);

const form = document.getElementById("pollForm");
const results = document.getElementById("results");
const choices = ["Corvette", "Tacoma", "Bronco"];

// Load results from DB
function updateResults(snapshot) {
  const data = snapshot.val() || {};
  const totalVotes = Object.values(data).reduce((sum, val) => sum + val, 0);

  choices.forEach(choice => {
    const count = data[choice] || 0;
    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    document.getElementById(`percent-${choice}`).textContent = `${percent}%`;
    document.getElementById(`bar-${choice}`).style.width = `${percent}%`;
  });

  results.classList.remove("hidden");
}

// Listen for live changes
onValue(ref(db, "votes"), updateResults);

// Submit vote
form.addEventListener("submit", e => {
  e.preventDefault();
  const selected = form.querySelector("input[name='vote']:checked");
  if (!selected) return alert("Please choose an option.");

  if (localStorage.getItem("drive865_voted")) {
    return alert("You already voted. Thanks!");
  }

  const vote = selected.value;
  const voteRef = ref(db, `votes/${vote}`);
  
  runTransaction(voteRef, current => (current || 0) + 1)
    .then(() => {
      localStorage.setItem("drive865_voted", vote);
      alert(`Thanks! You voted for ${vote}`);
      form.reset();
    });
});
