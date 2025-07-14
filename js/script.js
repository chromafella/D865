document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("carPollForm");
  const result = document.getElementById("pollResult");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const selected = form.querySelector("input[name='vote']:checked");
      if (selected) {
        const vote = selected.value;
        localStorage.setItem("drive865_vote", vote);
        result.textContent = `Thanks! You voted for: ${vote}`;
      } else {
        alert("Please select an option before voting.");
      }
    });

    // Optional: Show previous vote
    const savedVote = localStorage.getItem("drive865_vote");
    if (savedVote) {
      result.textContent = `You already voted for: ${savedVote}`;
    }
  }
});
