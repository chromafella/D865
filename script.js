// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue, get, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
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
const auth = getAuth(app);


let editingTripMeta = null; // keep this above

function closeTripEditModal() {
  const modal = document.getElementById("trip-edit-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  editingTripMeta = null;
}

let pendingDeleteTripId = null;

function openTripDeleteModalFromButton(btn) {
  const modal = document.getElementById("trip-delete-modal");
  const messageEl = document.getElementById("trip-delete-message");
  if (!modal) return;

  const tripId = btn.dataset.tripId;
  const carName = btn.dataset.carName || "this trip";
  const startDate = btn.dataset.startDate || "";
  const endDate = btn.dataset.endDate || "";

  pendingDeleteTripId = tripId;

  if (messageEl) {
    let msg = `Are you sure you want to delete your trip for ${carName}`;
    if (startDate && endDate) {
      msg += ` (${startDate} → ${endDate})`;
    }
    msg += `? This cannot be undone.`;
    messageEl.textContent = msg;
  }

  modal.classList.remove("hidden");
}

function closeTripDeleteModal() {
  const modal = document.getElementById("trip-delete-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  pendingDeleteTripId = null;
}



// =============================================
// CAR DATA (ALWAYS CHANGING)
//==============================================

const LOCATION_LABELS = {
  TYS: "TYS – McGhee Tyson Airport",
  PS_PARK: "Pearson Springs Park – Maryville, TN"
};


// Manual availability blocks: dates when the car is NOT available
// (use YYYY-MM-DD format)
const carAvailability = {
  "20BRZ": [
    { start: "2025-12-20", end: "2025-12-26" }, // example: Christmas trip booked
    { start: "2026-01-10", end: "2026-01-12" },
  ],
  "21MKV": [
    { start: "2025-12-20", end: "2025-12-26" }, // example: Christmas trip booked
    { start: "2026-01-10", end: "2026-01-12" },
  ],
  "13TTE": [
    { start: "2025-12-20", end: "2025-12-26" }, // example: Christmas trip booked
    { start: "2026-01-10", end: "2026-01-12" },
  ],
};



const carsData = {
  "20BRZ": {
    id: "20BRZ",
    name: "2020 Subaru BRZ Limited",
    image: "images/20brz.jpg",
    pricePerDay: 80,
    range: "City: 277miles | Freeway: 383miles",
    seats: 4,
    transmission: "Manual",
    fuel: "Premium Unleaded",
    location: "TYS Alcoa, TN | Pearson Springs Park, Maryville, TN",
    rating: 5.0,
    tripsCount: 74,
    description: "Great for rippin' manual gears on the Tail of the Dragon!",
    turoUrl: "https://turo.com/us/en/car-rental/united-states/maryville-tn/subaru/brz/2598717",
    highlights: [
      "6-speed manual transmission",
      "Premium audio system",
      "Apple CarPlay & Android Auto"
    ],
    rules: [
      "No smoking in the vehicle",
      "No track use or burnouts",
      "Return with the same fuel level"
    ],
  },
  "21MKV": {
    id: "21MKV",
    name: "2021 Toyota Supra",
    image: "images/21mkv.jpg",
    pricePerDay: 200,
    range: "City: 300miles | Freeway: 411miles",
    seats: 2,
    transmission: "Automatic",
    fuel: "Premium Unleaded",
    location: "TYS Alcoa, TN | Pearson Springs Park, Maryville, TN",
    rating: 4.88,
    tripsCount: 40,
    description: "Luxurious meets sporty. Great features packed into this mighty V8.",
    turoUrl: "https://turo.com/us/en/car-rental/united-states/maryville-tn/toyota/supra/3096859",
    highlights: [
      "Heads-up display",
      "Adaptive cruise control",
      "JBL premium sound system"
    ],
    rules: [
      "No smoking",
      "No pets",
      "No offroading"
    ],
  },
  "13TTE": {
    id: "13TTE",
    name: "2013 Toyota FJ Cruiser TTE",
    image: "images/13tte.jpg",
    pricePerDay: 60,
    range: "City: 285miles | Freeway: 380miles",
    seats: 5,
    transmission: "Automatic",
    fuel: "Unleaded",
    location: "TYS Alcoa, TN | Pearson Springs Park, Maryville, TN",
    rating: 5.0,
    tripsCount: 29,
    description: "Trail Teams Edition.",
    turoUrl: "https://turo.com/us/en/suv-rental/united-states/maryville-tn/toyota/fj-cruiser/31046000",
    highlights: [
      "Off-road tuned suspension",
      "All-terrain tires",
      "Roof rack and tow hitch"
    ],
    rules: [
      "No smoking",
      "Off-roading allowed on established trails only",
      "Dogs allowed with seat covers"
    ],
  },
  "17NPV": {
    id: "17NPV",
    name: "2017 Nissan NV",
    image: "images/17NPV.jpg",
    pricePerDay: 70,
    range: "City: 24mpg | Freeway: 26mpg | Avg. 348miles",
    seats: 12,
    transmission: "Automatic",
    fuel: "Unleaded",
    location: "TYS Alcoa, TN | Pearson Springs Park, Maryville, TN",
    rating: 5.0,
    tripsCount: 11,
    description: "Bring everyone you know!",
    turoUrl: "https://turo.com/us/en/van-rental/united-states/maryville-tn/nissan/nv/3279423",
    highlights: [
      "12 SEATS!",
      "V8 Engine",
      "In-Mirror backup camera"
    ],
    rules: [
      "No smoking/vaping of any kind",
      "DO NOT OFFROAD IN THIS VEHICLE.",
      "DO NOT WASH THIS VEHICLE. Getting rid of trash is always appreciated not expected."
    ],
  },

};






// =====================
// Poll form logic
// =====================

// Poll form elements
const pollForm = document.getElementById("pollForm");
const suggestionInput = document.getElementById("suggestionInput");
const pollResult = document.getElementById("pollResult");

// Event listener for poll submission
if (pollForm) {
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
    const pollRefLocal = ref(database, "pollSuggestions");
    push(pollRefLocal, { suggestion });

    // Set local flag
    localStorage.setItem("hasVotedPoll", "true");

    // UI feedback
    pollForm.reset();
    pollResult.textContent = "Thank you! Your suggestion has been recorded.";
    pollResult.classList.remove("hidden");
  });
}

const ticker = document.getElementById("ticker-text");

function updateTickerText(suggestions) {
  if (!ticker) return;

  if (!suggestions || Object.keys(suggestions).length === 0) {
    ticker.textContent = "No suggestions yet. Be the first to submit one!";
    return;
  }

  const entries = Object.values(suggestions);
  const text = entries
    .map((entry) => `Someone wants a: ${entry.suggestion}`)
    .join(" — ");
  ticker.textContent = text;
}

// Realtime updates
const pollRef = ref(database, "pollSuggestions");
onValue(pollRef, (snapshot) => {
  const data = snapshot.val();
  updateTickerText(data);
});

// =====================
// Auth (Login / Sign Up)
// =====================

// Grab auth-related DOM elements (make sure these IDs exist in your HTML)
const authModal = document.getElementById("auth-modal");
const authModalClose = document.getElementById("auth-modal-close");
const loginOpenBtn = document.getElementById("login-open-btn");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authError = document.getElementById("auth-error");
const authToggleBtn = document.getElementById("auth-toggle-btn");
const authToggleQuestion = document.getElementById("auth-toggle-question");
const authModalTitle = document.getElementById("auth-modal-title");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const userEmailDisplay = document.getElementById("user-email-display");
const profileLink = document.getElementById("profile-link");
const profileSection = document.getElementById("profile-section");
const profileForm = document.getElementById("profile-form");
const profileName = document.getElementById("profile-name");
const profilePhone = document.getElementById("profile-phone");
const profileFavoriteCar = document.getElementById("profile-favorite-car");
const profileStatus = document.getElementById("profile-status");
const profileEmail = document.getElementById("profile-email");
const isTripsPage = window.location.pathname.endsWith("trips.html");
const tripsBtn = document.getElementById("trips-btn");
const tripsList = document.getElementById("trips-list");
const tripsEmpty = document.getElementById("trips-empty");
const carDetailSection = document.getElementById("car-detail");



//CONFIRMATION POPUP
function openTripConfirmModal(message) {
  const modal = document.getElementById("trip-confirm-modal");
  const messageEl = document.getElementById("trip-confirm-message");

  if (!modal) return; // will just do nothing on pages that don't have this modal

  if (messageEl && message) {
    messageEl.textContent = message;
  }

  modal.classList.remove("hidden");
}

function closeTripConfirmModal() {
  const modal = document.getElementById("trip-confirm-modal");
  if (!modal) return;
  modal.classList.add("hidden");
}


let mode = "login"; // "login" or "signup"

function openModal() {
  if (!authModal) return;
  if (authError) authError.textContent = "";
  authModal.classList.remove("hidden");
}

function closeModal() {
  if (!authModal) return;
  authModal.classList.add("hidden");
  if (authForm) authForm.reset();
  if (authError) authError.textContent = "";
}

// Open modal
if (loginOpenBtn) {
  loginOpenBtn.addEventListener("click", openModal);
}

// Close modal (X button)
if (authModalClose) {
  authModalClose.addEventListener("click", closeModal);
}

// Close when clicking on backdrop
if (authModal) {
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });
}

if (tripsBtn) {
  tripsBtn.addEventListener("click", () => {
    window.location.href = "trips.html";
  });
}

//SAVETRIPFORCURRENTUSER

async function saveTripForCurrentUser(car) {
  const user = auth.currentUser;
  if (!user) {
    if (typeof openModal === "function") openModal();
    return;
  }

  const startInput = document.getElementById("trip-start");
  const endInput = document.getElementById("trip-end");
  const locationSelect = document.getElementById("trip-location");
  const tripStatusEl = document.getElementById("trip-status");

  if (!startInput || !endInput || !locationSelect) return;

  if (tripStatusEl) {
    tripStatusEl.textContent = "";
    tripStatusEl.classList.remove(
      "trip-status-success",
      "trip-status-error",
      "trip-status-muted"
    );
  }

  const startDate = startInput.value;
  const endDate = endInput.value;
  const locationCode = locationSelect.value;

  if (!startDate || !endDate) {
    if (tripStatusEl) {
      tripStatusEl.textContent = "Please pick start and end dates.";
      tripStatusEl.classList.add("trip-status-error");
    }
    return;
  }

  if (!locationCode) {
    if (tripStatusEl) {
      tripStatusEl.textContent = "Please select a pickup location.";
      tripStatusEl.classList.add("trip-status-error");
    }
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    if (tripStatusEl) {
      tripStatusEl.textContent = "End date must be after start date.";
      tripStatusEl.classList.add("trip-status-error");
    }
    return;
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let dayCount = Math.round((end - start) / ONE_DAY_MS) + 1;
  if (dayCount < 1) dayCount = 1;

  const estimatedTotal = dayCount * car.pricePerDay;
  const pickupLocation = LOCATION_LABELS[locationCode] || "Unknown location";

  const tripsRef = ref(database, "trips/" + user.uid);
  const newTripRef = push(tripsRef);
  const tripData = {
    carId: car.id,
    carName: car.name,
    startDate,
    endDate,
    pricePerDay: car.pricePerDay,
    dayCount,
    estimatedTotal,
    createdAt: Date.now(),
    locationCode,
    pickupLocation
  };

  if (tripStatusEl) {
    tripStatusEl.textContent = "Saving trip...";
    tripStatusEl.classList.add("trip-status-muted");
  }

  try {
    await set(newTripRef, tripData);

    // Clear fields
    startInput.value = "";
    endInput.value = "";
    locationSelect.value = "";

    // Clear inline status
    if (tripStatusEl) {
      tripStatusEl.textContent = "";
      tripStatusEl.classList.remove(
        "trip-status-success",
        "trip-status-error",
        "trip-status-muted"
      );
    }

    const msg =
      `Your trip for the ${car.name} has been booked for ${dayCount} ` +
      `day${dayCount > 1 ? "s" : ""}. Estimated total: $${estimatedTotal.toFixed(
        2
      )}. Pickup: ${pickupLocation}.`;

    openTripConfirmModal(msg);
  } catch (err) {
    console.error("Error saving trip:", err);
    if (tripStatusEl) {
      tripStatusEl.textContent = "Error saving trip. Please try again.";
      tripStatusEl.classList.remove("trip-status-muted");
      tripStatusEl.classList.add("trip-status-error");
    }
  }
}



//LOAD TRIPS

async function loadTrips(user) {
  if (!user || !tripsList) return;

  tripsList.innerHTML = "";
  if (tripsEmpty) tripsEmpty.textContent = "Loading trips...";

  const userTripsRef = ref(database, "trips/" + user.uid);
  const snapshot = await get(userTripsRef);

  if (!snapshot.exists()) {
    if (tripsEmpty) {
      tripsEmpty.textContent =
        "You don't have any trips yet. Book a car to get started.";
    }
    return;
  }

  const trips = snapshot.val();
  const tripEntries = Object.entries(trips).sort(
    (a, b) => (a[1].startDate || "").localeCompare(b[1].startDate || "")
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tripEntries.forEach(([tripId, trip]) => {
    const car = carsData[trip.carId];
    const startDate = trip.startDate;
    const endDate = trip.endDate;

    // calculate days
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    let dayCount = trip.dayCount || 1;
    if (start && end) {
      dayCount = Math.round((end - start) / ONE_DAY_MS) + 1;
      if (dayCount < 1) dayCount = 1;
    }

    const pricePerDay =
      trip.pricePerDay || (car ? car.pricePerDay : 0) || 0;
    const estimatedTotal =
      trip.estimatedTotal || dayCount * pricePerDay;

    const pickup =
  trip.pickupLocation ||
  (trip.locationCode && LOCATION_LABELS[trip.locationCode]) ||
  "Not set";


    // upcoming vs completed
    let statusLabel = "Upcoming";
    if (end && end < today) {
      statusLabel = "Completed";
    }

    const card = document.createElement("article");
    card.className = "car-card";

    const imgHtml = car
      ? `<img src="${car.image}" alt="${car.name}" style="width:100%;height:160px;object-fit:cover;border-bottom:1px solid rgba(255,255,255,0.05);">`
      : "";

    card.innerHTML = `
      ${imgHtml}
      <div class="car-card-body">
        <div class="car-name">
          ${trip.carName || (car ? car.name : "Trip")}
        </div>
        <div class="car-meta">
          ${startDate || "?"} → ${endDate || "?"}
          (${dayCount} day${dayCount > 1 ? "s" : ""})
        </div>
        <div class="car-meta">
          Status: ${statusLabel}
        </div>
        <div class="car-price">
          Approx total: $${estimatedTotal.toFixed(2)}
        </div>
        <div class="car-meta">
  Pickup: ${pickup}
</div>

        <div class="car-card-actions" style="margin-top:0.6rem;">
          ${
            car
              ? `<a href="car.html?id=${car.id}" class="view-details-btn">View car</a>`
              : ""
          }
          <button
  class="trip-action-btn"
  data-trip-action="reschedule"
  data-trip-id="${tripId}"
  data-car-id="${trip.carId || (car ? car.id : "")}"
  data-car-name="${trip.carName || (car ? car.name : "")}"
  data-price-per-day="${pricePerDay}"
  data-start-date="${startDate || ""}"
  data-end-date="${endDate || ""}"
  data-created-at="${trip.createdAt || ""}"
  data-location-code="${trip.locationCode || ""}"
  data-pickup-location="${pickup}"
>
  Reschedule
</button>


          <button
  class="trip-action-btn trip-action-danger"
  data-trip-action="delete"
  data-trip-id="${tripId}"
  data-car-name="${trip.carName || (car ? car.name : "this trip")}"
  data-start-date="${startDate || ""}"
  data-end-date="${endDate || ""}"
>
  Delete
</button>

        </div>
      </div>
    `;

    tripsList.appendChild(card);
  });

  if (tripsEmpty) {
    tripsEmpty.textContent =
      tripEntries.length === 0
        ? "You don't have any trips yet. Book a car to get started."
        : "";
  }
}



// Toggle between Login and Sign Up
if (authToggleBtn) {
  authToggleBtn.addEventListener("click", () => {
    if (!authModalTitle || !authSubmitBtn || !authToggleQuestion || !authToggleBtn) return;

    if (mode === "login") {
      mode = "signup";
      authModalTitle.textContent = "Sign Up";
      authSubmitBtn.textContent = "Create Account";
      authToggleQuestion.textContent = "Already have an account?";
      authToggleBtn.textContent = "Login";
    } else {
      mode = "login";
      authModalTitle.textContent = "Login";
      authSubmitBtn.textContent = "Login";
      authToggleQuestion.textContent = "Don't have an account?";
      authToggleBtn.textContent = "Sign up";
    }

    if (authError) authError.textContent = "";
  });
}

// Handle form submit (login/signup)
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (authError) authError.textContent = "";

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      closeModal();
    } catch (err) {
  console.error(err.code, err.message); // keep this for debugging

  let message = "Something went wrong. Please try again.";

  if (mode === "login") {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        message = "Email or password is incorrect.";
        break;
      case "auth/too-many-requests":
        message = "Too many failed attempts. Please try again later.";
        break;
      default:
        message = "Unable to log in. Please try again.";
    }
  } else if (mode === "signup") {
    switch (err.code) {
      case "auth/email-already-in-use":
        message = "That email is already in use. Try logging in instead.";
        break;
      case "auth/weak-password":
        message = "Password is too weak. Please use at least 6 characters.";
        break;
      default:
        message = "Unable to create your account. Please try again.";
    }
  }

  if (authError) authError.textContent = message;
}

  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html";
  });
}

async function loadUserProfile(user) {
  if (!user || !profileForm) return;

  try {
    const userRef = ref(database, "users/" + user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      if (profileName) profileName.value = data.name || "";
      if (profilePhone) profilePhone.value = data.phone || "";
      if (profileFavoriteCar) profileFavoriteCar.value = data.favoriteCar || "";
    } else {
      // No profile yet – clear fields
      if (profileName) profileName.value = "";
      if (profilePhone) profilePhone.value = "";
      if (profileFavoriteCar) profileFavoriteCar.value = "";
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    if (profileStatus) profileStatus.textContent = "Error loading profile.";
  }
}

if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!profileStatus) return;

    const user = auth.currentUser;
    if (!user) {
      profileStatus.textContent = "You must be logged in to save your profile.";
      return;
    }

    const userRef = ref(database, "users/" + user.uid);
    const profileData = {
      email: user.email,
      name: profileName ? profileName.value.trim() : "",
      phone: profilePhone ? profilePhone.value.trim() : "",
      favoriteCar: profileFavoriteCar ? profileFavoriteCar.value.trim() : ""
    };

    profileStatus.textContent = "Saving...";

    try {
      await set(userRef, profileData);
      profileStatus.textContent = "Profile saved!";
      setTimeout(() => {
        if (profileStatus) profileStatus.textContent = "";
      }, 2500);
    } catch (err) {
      console.error("Error saving profile:", err);
      profileStatus.textContent = "Error saving profile. Please try again.";
    }
  });
}



// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
      alert("Error signing out");
    }
  });
}

//PRETTY DATE!
// Pretty-print ISO date like "2025-12-20" -> "December 20th, 2025"
    function formatPrettyDate(isoStr) {
  if (!isoStr) return "";
  const [year, month, day] = isoStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // "December 20, 2025"
  const base = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dayNum = date.getDate();
  const suffix =
    dayNum % 10 === 1 && dayNum !== 11
      ? "st"
      : dayNum % 10 === 2 && dayNum !== 12
      ? "nd"
      : dayNum % 10 === 3 && dayNum !== 13
      ? "rd"
      : "th";

  return base.replace(String(dayNum) + ",", `${dayNum}${suffix},`);
}


window.addEventListener("DOMContentLoaded", () => {
    // Trip confirmation modal closing behavior
  const tripConfirmModal = document.getElementById("trip-confirm-modal");
  const tripConfirmClose = document.getElementById("trip-confirm-close");
  const tripEditModal = document.getElementById("trip-edit-modal");
  const tripEditForm = document.getElementById("trip-edit-form");
  const tripEditStart = document.getElementById("trip-edit-start");
  const tripEditEnd = document.getElementById("trip-edit-end");
  const tripEditStatus = document.getElementById("trip-edit-status");
  const tripEditCancel = document.getElementById("trip-edit-cancel");
  const tripEditSave = document.getElementById("trip-edit-save");
  const tripDeleteModal = document.getElementById("trip-delete-modal");
  const tripDeleteCancel = document.getElementById("trip-delete-cancel");
  const tripDeleteConfirm = document.getElementById("trip-delete-confirm");

    const userMenuToggle = document.getElementById("user-menu-toggle");
  const headerUserActions = document.getElementById("header-user-actions");

  if (userMenuToggle && headerUserActions) {
    userMenuToggle.addEventListener("click", () => {
      headerUserActions.classList.toggle("user-menu-open");
    });

    // Optional: close menu if you tap anywhere outside on mobile
    document.addEventListener("click", (e) => {
      if (!headerUserActions.classList.contains("user-menu-open")) return;

      const clickedInside =
        headerUserActions.contains(e.target) ||
        userMenuToggle.contains(e.target);

      if (!clickedInside) {
        headerUserActions.classList.remove("user-menu-open");
      }
    });
  }


  // Close when Cancel is pressed
  if (tripDeleteCancel) {
    tripDeleteCancel.addEventListener("click", () => {
      closeTripDeleteModal();
    });
  }

  // Confirm delete
  if (tripDeleteConfirm) {
    tripDeleteConfirm.addEventListener("click", async () => {
      if (!pendingDeleteTripId) {
        closeTripDeleteModal();
        return;
      }
      await deleteTrip(pendingDeleteTripId);
      closeTripDeleteModal();
    });
  }

  // Click on backdrop closes the delete modal
  if (tripDeleteModal) {
    tripDeleteModal.addEventListener("click", (e) => {
      if (e.target === tripDeleteModal) {
        closeTripDeleteModal();
      }
    });
  }


  function setupBookingUI(car) {
  const startInput = document.getElementById("trip-start");
  const endInput = document.getElementById("trip-end");
  const locationSelect = document.getElementById("trip-location");
  const totalText = document.getElementById("trip-total-text");
  const confirmBtn = document.getElementById("trip-confirm-btn");

  if (!startInput || !endInput || !locationSelect || !totalText || !confirmBtn) {
    return;
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  function recalc() {
    const startDate = startInput.value;
    const endDate = endInput.value;

    // default state every time
    locationSelect.disabled = true;
    confirmBtn.disabled = true;

    if (!startDate || !endDate) {
      totalText.textContent = "Select start and end dates to begin.";
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      totalText.textContent = "End date must be after start date.";
      return;
    }

    // ✅ dates are valid → enable location dropdown
    locationSelect.disabled = false;

    if (!locationSelect.value) {
      totalText.textContent = "Choose a pickup location next.";
      return;
    }

    // ✅ dates + location → compute total + enable confirm
    let dayCount = Math.round((end - start) / ONE_DAY_MS) + 1;
    if (dayCount < 1) dayCount = 1;

    const estimatedTotal = dayCount * car.pricePerDay;
    const locLabel =
      LOCATION_LABELS[locationSelect.value] || "selected pickup location";

    totalText.textContent =
      `Trip length: ${dayCount} day${dayCount > 1 ? "s" : ""}. ` +
      `Estimated total: $${estimatedTotal.toFixed(2)}. ` +
      `Pickup: ${locLabel}.`;

    confirmBtn.disabled = false;
  }

  // hook up the “calendar” + location
  startInput.addEventListener("change", recalc);
  endInput.addEventListener("change", recalc);
  locationSelect.addEventListener("change", recalc);

  recalc(); // set initial message
}





  //HELPER
    function openTripEditModalFromButton(btn) {
  if (!tripEditModal || !tripEditStart || !tripEditEnd) return;

  const tripId = btn.dataset.tripId;
  const carId = btn.dataset.carId || "";
  const carName = btn.dataset.carName || "trip";
  const pricePerDay = Number(btn.dataset.pricePerDay || "0");
  const startDate = btn.dataset.startDate || "";
  const endDate = btn.dataset.endDate || "";
  const createdAt = btn.dataset.createdAt || "";
  const locationCode = btn.dataset.locationCode || "";
  const pickupLocation = btn.dataset.pickupLocation || "";

  editingTripMeta = {
    tripId,
    carId,
    carName,
    pricePerDay,
    createdAt,
    locationCode,
    pickupLocation
  };

  tripEditStart.value = startDate;
  tripEditEnd.value = endDate;

  if (tripEditStatus) {
    tripEditStatus.textContent = "";
    tripEditStatus.className = "trip-status";
  }

  const titleEl = document.getElementById("trip-edit-title");
  if (titleEl) {
    titleEl.textContent = `Reschedule ${carName}`;
  }

  tripEditModal.classList.remove("hidden");
}



  //Save Edited Trip
    async function saveEditedTrip(e) {
    if (e) e.preventDefault();

    if (!editingTripMeta) return;
    const user = auth.currentUser;
    if (!user) return;

    if (!tripEditStart || !tripEditEnd || !tripEditStatus) return;

    const startDate = tripEditStart.value;
    const endDate = tripEditEnd.value;

    tripEditStatus.textContent = "";
    tripEditStatus.className = "trip-status";

    if (!startDate || !endDate) {
      tripEditStatus.textContent = "Please pick start and end dates.";
      tripEditStatus.classList.add("trip-status-error");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      tripEditStatus.textContent = "End date must be after start date.";
      tripEditStatus.classList.add("trip-status-error");
      return;
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    let dayCount = Math.round((end - start) / ONE_DAY_MS) + 1;
    if (dayCount < 1) dayCount = 1;

    const pricePerDay = editingTripMeta.pricePerDay || 0;
    const estimatedTotal = dayCount * pricePerDay;

    tripEditStatus.textContent = "Saving changes...";
    tripEditStatus.classList.add("trip-status-muted");

    const tripRef = ref(
      database,
      "trips/" + user.uid + "/" + editingTripMeta.tripId
    );

    const updatedTripData = {
  carId: editingTripMeta.carId,
  carName: editingTripMeta.carName,
  startDate,
  endDate,
  pricePerDay,
  dayCount,
  estimatedTotal,
  createdAt: editingTripMeta.createdAt || Date.now(),
  locationCode: editingTripMeta.locationCode || "",
  pickupLocation: editingTripMeta.pickupLocation || ""
};


    try {
      await set(tripRef, updatedTripData);
      tripEditStatus.textContent = "Trip updated.";
      tripEditStatus.classList.remove("trip-status-muted");
      tripEditStatus.classList.add("trip-status-success");

      // refresh list & close after a moment
      await loadTrips(user);
      setTimeout(() => {
        closeTripEditModal();
      }, 400);
    } catch (err) {
      console.error("Error updating trip:", err);
      tripEditStatus.textContent = "Error saving changes. Please try again.";
      tripEditStatus.classList.remove("trip-status-muted");
      tripEditStatus.classList.add("trip-status-error");
    }
  }


// Delete Trip

  async function deleteTrip(tripId) {
  const user = auth.currentUser;
  if (!user || !tripId) return;

  const tripRef = ref(database, "trips/" + user.uid + "/" + tripId);
  try {
    await set(tripRef, null); // delete
    await loadTrips(user);
  } catch (err) {
    console.error("Error deleting trip:", err);
    alert("There was an error deleting the trip. Please try again.");
  }
}


    // Reschedule modal buttons
  if (tripEditCancel) {
    tripEditCancel.addEventListener("click", (e) => {
      e.preventDefault();
      closeTripEditModal();
    });
  }

  if (tripEditForm && tripEditSave) {
    tripEditForm.addEventListener("submit", saveEditedTrip);
  }

  if (tripEditModal) {
    tripEditModal.addEventListener("click", (e) => {
      if (e.target === tripEditModal) {
        closeTripEditModal();
      }
    });
  }

  // Trip card actions: reschedule + delete
    document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-trip-action]");
    if (!btn) return;

    const action = btn.dataset.tripAction;
    const tripId = btn.dataset.tripId;
    if (!tripId) return;

    if (action === "delete") {
      // ⬅️ open custom modal instead of window.confirm
      openTripDeleteModalFromButton(btn);
    } else if (action === "reschedule") {
      openTripEditModalFromButton(btn);
    }
  });




  if (tripConfirmClose) {
    tripConfirmClose.addEventListener("click", () => {
      closeTripConfirmModal();
    });
  }

  if (tripConfirmModal) {
    tripConfirmModal.addEventListener("click", (e) => {
      // If they click the dark backdrop (not the inner box), close it
      if (e.target === tripConfirmModal) {
        closeTripConfirmModal();
      }
    });
  }

  // ...your existing code (poll, auth, profile, etc.)...
  if (isCarDetailPage) {
  document.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "trip-form") {
      e.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const carId = params.get("id");
      const car = carId ? carsData[carId] : null;
      if (car) {
        saveTripForCurrentUser(car);
      }
    }
  });
}


  // ----- Cars page rendering -----
  const carsGrid = document.getElementById("cars-grid");
  const isCarsPage = window.location.pathname.endsWith("cars.html");

  if (isCarsPage && carsGrid && carsData) {
  carsGrid.innerHTML = "";

  Object.values(carsData).forEach((car) => {
    const card = document.createElement("article");
    card.className = "car-card";

    card.innerHTML = `
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.name}">
      </div>
      <div class="car-card-body">
        <div class="car-card-header">
          <h2 class="car-name">${car.name}</h2>
          <div class="car-price">$${car.pricePerDay}/day</div>
        </div>

        <div class="car-meta-line">
          <span>${car.seats} seats</span>
          <span>• ${car.transmission}</span>
          <span>• ${car.fuel}</span>
        </div>

        <div class="car-meta-range">${car.range}</div>

        <p class="car-desc">${car.description}</p>

        <div class="car-card-footer">
          <a href="car.html?id=${car.id}" class="car-link">
            View details
          </a>
        </div>
      </div>
    `;

    carsGrid.appendChild(card);
  });
}

});

const isCarDetailPage = window.location.pathname.endsWith("car.html");

if (isCarDetailPage && carDetailSection) {
  const params = new URLSearchParams(window.location.search);
  const carId = params.get("id");
  const car = carId ? carsData[carId] : null;

  if (!car) {
    carDetailSection.innerHTML = `
      <p>Sorry, we couldn't find that car.</p>
      <p><a href="cars.html" class="view-details-btn">Back to all cars</a></p>
    `;
  } else {
    // ratingLine, highlightsHtml, rulesHtml like before...
    let ratingLine = "";
    if (typeof car.rating === "number") {
      ratingLine = `
        <div class="detail-rating-line">
          <span class="detail-rating">★ ${car.rating.toFixed(2)}</span>
          ${car.tripsCount ? `<span class="detail-dot">•</span><span class="detail-trips">${car.tripsCount} trips</span>` : ""}
          ${car.location ? `<span class="detail-dot">•</span><span class="detail-location">${car.location}</span>` : ""}
        </div>
      `;
    }

    const highlightsHtml = car.highlights && car.highlights.length
      ? `<ul class="detail-list">${car.highlights.map(h => `<li>${h}</li>`).join("")}</ul>`
      : "";

    const rulesHtml = car.rules && car.rules.length
      ? `<ul class="detail-list">${car.rules.map(r => `<li>${r}</li>`).join("")}</ul>`
      : "";

    carDetailSection.innerHTML = `
  <article class="car-detail-card">
    <div class="car-detail-media">
  <img src="${car.image}" alt="${car.name}" class="car-detail-image">

  <div class="car-media-footer">
  <a
    href="${car.turoUrl || '#'}"
    target="_blank"
    rel="noopener"
    class="turo-btn ${car.turoUrl ? '' : 'turo-btn-disabled'}"
  >
    <span class="turo-prefix">Book on</span>
    <img src="images/turo-logo.png" alt="Turo" class="turo-logo-img">
  </a>

  <div id="availability-panel" class="availability-panel"></div>
</div>



    <div class="car-detail-body">

      <a href="cars.html" class="back-link">&larr; Back to all cars</a>

      <h1>${car.name}</h1>

      ${ratingLine}

      <div class="detail-specs-row">
        <div class="detail-tag">${car.seats} seats</div>
        <div class="detail-tag">${car.transmission}</div>
        <div class="detail-tag">${car.fuel}</div>
      </div>

      <p class="car-detail-range">${car.range}</p>
      <p class="car-detail-description">${car.description}</p>

      <!-- NEW: big booking section -->
      <section class="booking-section">
      <h1>NEW: Book Directly Through Drive865</h1>
        <h2>Schedule your trip with us directly & Save!</h2>
        <p class="booking-price-line">
          $${car.pricePerDay}<span>/day</span>
        </p>

        <form id="trip-form" class="booking-form">
          <div class="booking-dates-row">
            <div class="booking-date-field">
              <label for="trip-start">Start date</label>
              <input type="date" id="trip-start" required>
            </div>
            <div class="booking-date-field">
              <label for="trip-end">End date</label>
              <input type="date" id="trip-end" required>
            </div>
          </div>

          <div class="booking-location-row">
            <label for="trip-location">Pickup location</label>
            <select id="trip-location" disabled required>
              <option value="">Select a location</option>
              <option value="TYS">${LOCATION_LABELS.TYS}</option>
              <option value="PS_PARK">${LOCATION_LABELS.PS_PARK}</option>
            </select>
          </div>

          <div class="booking-summary">
            <p id="trip-total-text" class="booking-total-text">
              Select start and end dates to begin.
            </p>
            <p id="trip-status" class="trip-status"></p>
          </div>

          <button
            type="submit"
            id="trip-confirm-btn"
            class="view-details-btn booking-confirm-btn"
            disabled
          >
            Confirm trip
          </button>
        </form>
      </section>

      <div class="detail-sections-grid">
        <section class="detail-section">
          <h2>What this car offers</h2>
          ${
            highlightsHtml ||
            "<p class='detail-muted'>Host hasn’t added highlights yet.</p>"
          }
        </section>

        <aside class="detail-sidebar">
          <div class="detail-rules-box">
            <h3>Trip rules</h3>
            ${
              rulesHtml ||
              "<p class='detail-muted'>Standard Drive865 rules apply.</p>"
            }
          </div>
        </aside>
      </div>
    </div>
  </article>
`;

setupBookingUI(car);
renderAvailabilityPanel(car);



  }
}

function rangeOverlapsUnavailable(start, end, blocks) {
  if (!blocks || !blocks.length) return false;
  const s = new Date(start);
  const e = new Date(end);
  if (s > e) return true;

  return blocks.some((block) => {
    const bs = new Date(block.start);
    const be = new Date(block.end);
    // overlap if start <= be and end >= bs
    return s <= be && e >= bs;
  });
}


function renderAvailabilityPanel(car) {
  const panel = document.getElementById("availability-panel");
  if (!panel) return;

  const blocks = carAvailability[car.id] || [];

  if (!blocks.length) {
    panel.textContent = "No blocked dates — car is generally available.";
    return;
  }

  let html = `<strong>Unavailable dates:</strong><ul>`;
  blocks.forEach((block) => {
    const startPretty = formatPrettyDate(block.start);
    const endPretty = formatPrettyDate(block.end);
    html += `<li>${startPretty} → ${endPretty}</li>`;
  });
  html += `</ul>`;
  panel.innerHTML = html;
}



// Booking UI helper for car.html
function setupBookingUI(car) {
  const startInput = document.getElementById("trip-start");
  const endInput = document.getElementById("trip-end");
  const locationSelect = document.getElementById("trip-location");
  const totalText = document.getElementById("trip-total-text");
  const confirmBtn = document.getElementById("trip-confirm-btn");
  const statusEl = document.getElementById("trip-status");

  if (!startInput || !endInput || !locationSelect || !totalText || !confirmBtn) {
    return;
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const blocks = carAvailability[car.id] || [];

  function recalc() {
    const startDate = startInput.value;
    const endDate = endInput.value;

    locationSelect.disabled = true;
    confirmBtn.disabled = true;

    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "trip-status";
    }

    if (!startDate || !endDate) {
      totalText.textContent = "Select start and end dates to begin.";
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      totalText.textContent = "End date must be after start date.";
      return;
    }

    // 🔴 Check against unavailable blocks
    if (rangeOverlapsUnavailable(startDate, endDate, blocks)) {
      totalText.textContent =
        "These dates overlap an existing trip. Please choose different dates.";
      if (statusEl) {
        statusEl.textContent =
          "Selected range is not available based on the host calendar.";
        statusEl.classList.add("trip-status-error");
      }
      return;
    }

    // ✅ dates are valid AND available → allow location choice
    locationSelect.disabled = false;

    if (!locationSelect.value) {
      totalText.textContent = "Choose a pickup location next.";
      return;
    }

    let dayCount = Math.round((end - start) / ONE_DAY_MS) + 1;
    if (dayCount < 1) dayCount = 1;

    const estimatedTotal = dayCount * car.pricePerDay;
    const locLabel =
      LOCATION_LABELS[locationSelect.value] || "selected pickup location";

    totalText.textContent =
      `Trip length: ${dayCount} day${dayCount > 1 ? "s" : ""}. ` +
      `Estimated total: $${estimatedTotal.toFixed(2)}. ` +
      `Pickup: ${locLabel}.`;

    confirmBtn.disabled = false;
  }

  startInput.addEventListener("change", recalc);
  endInput.addEventListener("change", recalc);
  locationSelect.addEventListener("change", recalc);

  recalc();
}







// React to auth state changes
onAuthStateChanged(auth, (user) => {
  const onProfilePage = window.location.pathname.endsWith("profile.html");

  if (user) {
    if (userEmailDisplay) userEmailDisplay.textContent = user.email;
    if (loginOpenBtn) loginOpenBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (profileBtn) profileBtn.style.display = "inline-block";
    if (tripsBtn) tripsBtn.style.display = "inline-block";

    if (onProfilePage) {
      if (profileEmail) profileEmail.textContent = "Signed in as: " + user.email;
      loadUserProfile(user);
    }

    if (isTripsPage) {
      loadTrips(user);
    }
  } else {
    if (userEmailDisplay) userEmailDisplay.textContent = "";
    if (loginOpenBtn) loginOpenBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "none";
    if (tripsBtn) tripsBtn.style.display = "none";
    if (isTripsPage || onProfilePage) {
      windows.location.href = "index.html";
    }

    if (onProfilePage || isTripsPage) {
      window.location.href = "index.html";
    }
  }
});




