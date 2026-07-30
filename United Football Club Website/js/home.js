// Card Slider
let currentCard = 0;
const cardSlides = document.querySelectorAll('.card-slide');

function showCardSlide(n) {
    cardSlides.forEach(slide => slide.classList.remove('active'));
    cardSlides[n % cardSlides.length].classList.add('active');
}

function nextCardSlide() {
    currentCard++;
    showCardSlide(currentCard);
}

function prevCardSlide() {
    currentCard--;
    showCardSlide(currentCard);
}

// Auto slide
setInterval(() => {
    currentCard++;
    showCardSlide(currentCard);
}, 10000);

// Initialize slider
document.addEventListener('DOMContentLoaded', () => {
    if (cardSlides.length > 0) {
        showCardSlide(0);
    }
});








// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    window.location.reload();   // Force full refresh for better dark mode
}

// Load on every page
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (cardSlides.length > 0) {
        showCardSlide(0);
    }
    console.log("Home page initialized");
});








// ====================== RENDER VIDEOS FROM SUPABASE ======================

async function renderVideos() {
  const grid = document.getElementById("videosGrid");
  if (!grid) return;

  grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:60px; color:#666;">Loading videos...</p>`;

  try {
    const { data: videos, error } = await supabaseClient
      .from("videos")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error(error);
      grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Failed to load videos</p>`;
      return;
    }

    grid.innerHTML = "";

    if (!videos || videos.length === 0) {
      grid.innerHTML = `
        <p style="grid-column:1/-1; text-align:center; padding:80px 20px; color:#777; font-size:1.1rem;">
          No videos added yet. Add some from the Admin Panel.
        </p>`;
      return;
    }

    videos.forEach(video => {
      const card = document.createElement("div");
      card.className = "video-card";

      card.innerHTML = `
        <div class="video-thumbnail">
          <img src="${video.thumbnail || 'images/default-video.jpg'}" alt="${video.title}">
          <div class="play-overlay">▶</div>
        </div>
        <div class="video-content">
          <h4>${video.title}</h4>
          <p class="video-date">${video.date || ''}</p>
          <p class="video-desc">${video.description ? video.description.substring(0, 110) + '...' : ''}</p>
          <button class="btn-small" onclick="window.location.href='video.html?id=${video.id}'">Watch Now</button>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:red;">Error loading videos</p>`;
  }
}

// Play video by ID (safer method)
async function playVideoById(id) {
  try {
    const { data: video, error } = await supabaseClient
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !video) {
      alert("Video not found");
      return;
    }

    // Prefer normal URL if available
    if (video.url && video.url.startsWith("http")) {
      window.open(video.url, "_blank");
      return;
    }

    // Play base64 video
    if (video.video_file && video.video_file.startsWith("data:video")) {
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`
        <html>
          <head>
            <title>${video.title || "United FC Video"}</title>
            <style>
              body {
                margin: 0;
                background: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              video {
                max-width: 100%;
                max-height: 100%;
              }
            </style>
          </head>
          <body>
            <video controls autoplay>
              <source src="${video.video_file}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </body>
        </html>
      `);
      return;
    }

    alert("This video cannot be played.");
  } catch (err) {
    console.error(err);
    alert("Error playing video");
  }
}

// Call it when page loads
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("videosGrid")) {
    renderVideos();
  }
});







// ====================== MATCHES - SYNC ======================

function getAllMatches() {
    return JSON.parse(localStorage.getItem("allMatches")) || [];
}

function renderMatches() {
    const grid = document.getElementById("matchesGrid");
    if (!grid) return;

    const matches = getAllMatches();
    
    // Latest played match first + all upcoming matches
    const played = matches
        .filter(m => m.score && !m.score.includes("VS") && m.score.trim() !== "")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const upcoming = matches.filter(m => !m.score || m.score.includes("VS") || m.score.trim() === "");

    const displayMatches = [...(played.length ? [played[0]] : []), ...upcoming];

    grid.innerHTML = "";

    if (displayMatches.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:120px 20px; color:#666;">No matches available yet.<br>Add from Admin Panel.</p>`;
        return;
    }

    displayMatches.forEach(match => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `
            <div class="match-date">${match.date} • ${match.time || ''}</div>
            <h3>${match.competition}</h3>
            <div class="teams">
                <div>${match.homeTeam}</div>
                <strong>${match.score || 'VS'}</strong>
                <div>${match.awayTeam}</div>
            </div>
            <p class="venue">${match.venue}</p>
            <button class="btn-small">Match Details →</button>
        `;
        grid.appendChild(card);
    });
}

// Initialize Matches
document.addEventListener('DOMContentLoaded', () => {
    renderMatches();
    
    // Refresh when returning from Admin
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) renderMatches();
    });
});







// Back to Top Button
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.style.display = window.scrollY > 1000 ? "flex" : "none";
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}









/* UPGRADED SEARCH WITH VISIBLE ARROWS */
let currentHighlights = [];
let currentHighlightIndex = -1;

function toggleSearch(){
    const box = document.getElementById("searchBox");
    box.classList.toggle("active");
    if (box.classList.contains("active")) box.focus();
}

const searchBox = document.getElementById("searchBox");
const resultsBox = document.getElementById("searchResults");

searchBox.addEventListener("input", function(){
    const term = this.value.toLowerCase().trim();
    resultsBox.innerHTML = "";
    clearHighlights();

    if (term.length < 2) {
        resultsBox.style.display = "none";
        return;
    }

    resultsBox.style.display = "block";

    let resultsHTML = "";

    // Search current page content
    const elements = document.querySelectorAll("h1, h2, h3, p, .match-card, .player-card, .video-card, .team-player-card");
    let totalMatches = 0;

    elements.forEach(el => {
        if (el.textContent.toLowerCase().includes(term)) totalMatches++;
    });

    if (totalMatches > 0) {
        resultsHTML += `
            <div class="result-item main-result" onclick="highlightAllAndCycle('${term}')">
                📍 Found <strong>${totalMatches}</strong> times on this page
                ${totalMatches > 1 ? `
                <span class="nav-arrows">
                    <button onclick="prevHighlight(event)">↑</button>
                    <button onclick="nextHighlight(event)">↓</button>
                </span>` : ''}
            </div>`;
    }

    // Search Players
    const players = JSON.parse(localStorage.getItem("teamPlayers")) || [];
    const matchedPlayers = players.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.position && p.position.toLowerCase().includes(term))
    );

    matchedPlayers.forEach(player => {
        resultsHTML += `
            <div class="result-item" onclick="goToPlayer(${player.id}); event.stopImmediatePropagation();">
                👤 ${player.name} — ${player.position}
            </div>`;
    });

    if (resultsHTML === "") {
        resultsHTML = `<div class="result-item">No results found for "<strong>${term}</strong>"</div>`;
    }

    resultsBox.innerHTML = resultsHTML;
});

function highlightAllAndCycle(term) {
    clearHighlights();

    const elements = document.querySelectorAll("h1, h2, h3, p, .match-card, .player-card, .video-card, .team-player-card");

    elements.forEach(el => {
        if (el.textContent.toLowerCase().includes(term)) {
            currentHighlights.push(el);
            el.style.transition = "background 0.4s";
            el.style.background = "#fff3cd";
        }
    });

    if (currentHighlights.length > 0) {
        currentHighlightIndex = 0;
        scrollToCurrentHighlight();
    }
}

function scrollToCurrentHighlight() {
    if (currentHighlights.length === 0) return;
    const el = currentHighlights[currentHighlightIndex];
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.background = "#ffe066";
    setTimeout(() => el.style.background = "#fff3cd", 1200);
}

function nextHighlight(e) {
    e.stopImmediatePropagation();
    if (currentHighlights.length === 0) return;
    currentHighlightIndex = (currentHighlightIndex + 1) % currentHighlights.length;
    scrollToCurrentHighlight();
}

function prevHighlight(e) {
    e.stopImmediatePropagation();
    if (currentHighlights.length === 0) return;
    currentHighlightIndex = (currentHighlightIndex - 1 + currentHighlights.length) % currentHighlights.length;
    scrollToCurrentHighlight();
}

function clearHighlights() {
    currentHighlights.forEach(el => el.style.background = "");
    currentHighlights = [];
    currentHighlightIndex = -1;
}

function goToPlayer(id) {
    window.location.href = `player.html?id=${id}`;
}