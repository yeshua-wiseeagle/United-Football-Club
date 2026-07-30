// ====================== RENDER MATCHES FROM SUPABASE ======================

async function renderMatches() {
  const grid = document.getElementById("matchesGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:60px; color:#666;">Loading matches...</p>`;

  try {
    const { data: matches, error } = await supabaseClient
      .from("matches")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Failed to load matches</p>`;
      return;
    }

    // Separate played and upcoming
    const played = matches.filter(m => m.score && !m.score.includes("VS") && m.score.trim() !== "");
    const upcoming = matches.filter(m => !m.score || m.score.includes("VS") || m.score.trim() === "");

    // Show latest played match + all upcoming
    const display = [...(played.length ? [played[0]] : []), ...upcoming];

    grid.innerHTML = "";

    if (display.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:100px; color:#666;">No matches available yet.</p>`;
      return;
    }

    display.forEach(match => {
      const isUpcoming = !match.score || match.score.includes("VS") || match.score.trim() === "";

      const card = document.createElement("div");
      card.className = `match-card ${isUpcoming ? "upcoming" : ""}`;
      card.innerHTML = `
        <div class="match-date">${formatDate(match.date)} • ${match.time || ""}</div>
        <div class="match-content">
          <div class="competition">${match.competition || "Friendly"}</div>
          
          <div class="teams">
            <div class="team">
              <img src="${match.home_logo || "images/default-team.png"}" class="team-logo" alt="${match.home_team}">
              <p>${match.home_team}</p>
            </div>
            <div class="score-box" ${isUpcoming ? `data-time="${match.time || ""}"` : ""}>
              ${match.score || "VS"}
            </div>
            <div class="team">
              <img src="${match.away_logo || "images/default-team.png"}" class="team-logo" alt="${match.away_team}">
              <p>${match.away_team}</p>
            </div>
          </div>

          <p class="venue">${match.venue}</p>
          <button class="btn-small">Match Details →</button>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Error loading matches</p>`;
  }
}

// Helper function for date formatting
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const options = { weekday: "short", day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options).toUpperCase();
}

// Call it when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("matchesGrid")) {
    renderMatches();
  }
});










// ====================== PREVIOUS MATCHES (SUPABASE) ======================

let visibleCount = 6;
const increment = 3;

async function renderPreviousMatches() {
  const grid = document.getElementById("previousMatchesGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="text-align:center; padding:60px; color:#666;">Loading previous matches...</p>`;

  try {
    const { data: matches, error } = await supabaseClient
      .from("matches")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
      grid.innerHTML = `<p style="text-align:center; color:red;">Failed to load matches</p>`;
      return;
    }

    // Only played matches
    let played = matches.filter(m => m.score && !m.score.includes("VS") && m.score.trim() !== "");

    // Sorting
    const sortBy = document.getElementById("sortPrevious")?.value || "newest";

    switch (sortBy) {
      case "oldest":
        played.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "home":
        played.sort((a, b) => a.home_team.localeCompare(b.home_team));
        break;
      case "away":
        played.sort((a, b) => a.away_team.localeCompare(b.away_team));
        break;
      case "competition":
        played.sort((a, b) => a.competition.localeCompare(b.competition));
        break;
      default: // newest
        played.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const toShow = Math.min(visibleCount, played.length);

    grid.innerHTML = "";

    if (toShow === 0) {
      grid.innerHTML = `<p style="text-align:center; padding:120px; color:#666;">No previous matches yet.</p>`;
      return;
    }

    played.slice(0, toShow).forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";
      card.innerHTML = `
        <div class="match-date">${formatDate(match.date)} • ${match.time || ""}</div>
        <div class="match-content">
          <div class="competition">${match.competition || "Friendly"}</div>
          
          <div class="teams">
            <div class="team">
              <img src="${match.home_logo || "images/default-team.png"}" class="team-logo" alt="${match.home_team}">
              <p>${match.home_team}</p>
            </div>
            <div class="score-box">${match.score}</div>
            <div class="team">
              <img src="${match.away_logo || "images/default-team.png"}" class="team-logo" alt="${match.away_team}">
              <p>${match.away_team}</p>
            </div>
          </div>

          <p class="venue">${match.venue}</p>
          <button class="btn-small">Match Details →</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Update button text
    const btn = document.getElementById("viewMoreBtn");
    if (btn) {
      btn.textContent = (visibleCount >= played.length) ? "View Less" : "View More";
    }

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="text-align:center; color:red;">Error loading matches</p>`;
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Homepage
  if (document.getElementById("matchesGrid")) {
    renderMatches();
  }

  // Previous Matches page
  if (document.getElementById("previousMatchesGrid")) {
    renderPreviousMatches();

    const sortSelect = document.getElementById("sortPrevious");
    if (sortSelect) {
      sortSelect.addEventListener("change", renderPreviousMatches);
    }

    const viewMoreBtn = document.getElementById("viewMoreBtn");
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener("click", () => {
        if (viewMoreBtn.textContent === "View Less") {
          visibleCount = 6;
        } else {
          visibleCount += increment;
        }
        renderPreviousMatches();
      });
    }
  }
});