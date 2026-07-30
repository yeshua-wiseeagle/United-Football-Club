// js/admin.js - FINAL CLEAN VERSION

const ADMIN_PASSWORD = "wiseeagle";
const DELETE_PASSWORD = "yeshua";

let editingTeamPlayerId = null;
let teamImageBase64 = "";

let editingPlayerId = null;
let editingMatchId = null;
let editingVideoId = null;

let videoThumbnailBase64 = "";

// ====================== GLOBAL DATA ======================
let allPlayers = JSON.parse(localStorage.getItem("allPlayers")) || [
    { id: 1, name: "Ephraim", position: "Forward", appearances: 12, minutesPlayed: 980, goals: 8, assists: 3, yellowCards: 2, redCards: 0, injury: "None", recovery: "N/A" },
    { id: 2, name: "Josh Yeshua", position: "Forward", appearances: 15, minutesPlayed: 1240, goals: 6, assists: 9, yellowCards: 1, redCards: 0, injury: "None", recovery: "N/A" },
    { id: 3, name: "Isaiah", position: "Defender", appearances: 18, minutesPlayed: 1580, goals: 1, assists: 4, yellowCards: 4, redCards: 1, injury: "Hamstring Strain", recovery: "Expected Return: 18 May 2026" }
];

let allMatches = JSON.parse(localStorage.getItem("allMatches")) || [];






// ====================== DASHBOARD PLAYERS ======================
function savePlayers() {
    localStorage.setItem("allPlayers", JSON.stringify(allPlayers));
}

function loadAdminPlayers() {
    const container = document.getElementById("adminPlayersList");
    if (!container) return;
    container.innerHTML = `<h3>All Players (${allPlayers.length})</h3>`;

    allPlayers.forEach(player => {
        const div = document.createElement("div");
        div.className = "admin-player-card";
        div.innerHTML = `
            <div>
                <strong>${player.name}</strong> — ${player.position}<br>
                Apps: ${player.appearances} | Goals: ${player.goals} | Assists: ${player.assists}<br>
                <span style="color:${player.injury === 'None' ? 'green' : 'red'}">${player.injury}</span>
            </div>
            <div>
                <button onclick="startEditPlayer(${player.id})">Edit</button>
                <button onclick="deletePlayer(${player.id})" style="background:#e74c3c;">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function startEditPlayer(id) {
    const pass = prompt("Enter Admin Password to Edit:");
    if (pass !== ADMIN_PASSWORD) return alert("❌ Wrong Password!");
    const player = allPlayers.find(p => p.id === id);
    if (!player) return;
    editingPlayerId = id;
    document.getElementById("name").value = player.name;
    document.getElementById("position").value = player.position;
    document.getElementById("appearances").value = player.appearances;
    document.getElementById("minutesPlayed").value = player.minutesPlayed;
    document.getElementById("goals").value = player.goals;
    document.getElementById("assists").value = player.assists;
    document.getElementById("yellowCards").value = player.yellowCards;
    document.getElementById("redCards").value = player.redCards;
    document.getElementById("injury").value = player.injury;
    document.getElementById("recovery").value = player.recovery;
    document.getElementById("submitBtn").textContent = "Update Player";
}

function deletePlayer(id) {
    const pass = prompt("Enter DELETE Password:");
    if (pass !== DELETE_PASSWORD) return alert("❌ Wrong Password!");
    if (confirm("Delete this player permanently?")) {
        allPlayers = allPlayers.filter(p => p.id !== id);
        savePlayers();
        loadAdminPlayers();
        alert("✅ Player deleted.");
    }
}

document.getElementById("playerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const pass = prompt("Enter Admin Password to Save:");
    if (pass !== ADMIN_PASSWORD) return alert("❌ Wrong Password!");

    const playerData = {
        id: editingPlayerId || Date.now(),
        name: document.getElementById("name").value.trim(),
        position: document.getElementById("position").value,
        appearances: parseInt(document.getElementById("appearances").value) || 0,
        minutesPlayed: parseInt(document.getElementById("minutesPlayed").value) || 0,
        goals: parseInt(document.getElementById("goals").value) || 0,
        assists: parseInt(document.getElementById("assists").value) || 0,
        yellowCards: parseInt(document.getElementById("yellowCards").value) || 0,
        redCards: parseInt(document.getElementById("redCards").value) || 0,
        injury: document.getElementById("injury").value.trim() || "None",
        recovery: document.getElementById("recovery").value.trim() || "N/A"
    };

    if (editingPlayerId) {
        const index = allPlayers.findIndex(p => p.id === editingPlayerId);
        if (index !== -1) allPlayers[index] = playerData;
        alert("✅ Player updated successfully!");
    } else {
        allPlayers.push(playerData);
        alert("✅ New Player added successfully!");
    }

    savePlayers();
    loadAdminPlayers();
    document.getElementById("playerForm").reset();
    editingPlayerId = null;
    document.getElementById("submitBtn").textContent = "Add New Player";
});














// ====================== TEAM PLAYERS - SUPABASE ======================

async function loadTeamPlayers() {
  const list = document.getElementById("teamPlayersList");
  if (!list) return;

  list.innerHTML = `<p style="text-align:center; padding:40px;">Loading...</p>`;

  const { data: teamPlayers, error } = await supabaseClient
    .from("team_players")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    list.innerHTML = `<p style="color:red; text-align:center;">Failed to load players</p>`;
    return;
  }

  list.innerHTML = "";

  if (!teamPlayers || teamPlayers.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding:60px; color:#666;">No team players added yet.</p>`;
    return;
  }

  teamPlayers.forEach(player => {
    const div = document.createElement("div");
    div.className = "team-player-card";
    div.innerHTML = `
      <img src="${player.image || 'images/default-player.png'}" alt="${player.name}">
      <div class="team-player-info">
        <h4>${player.name}</h4>
        <p>${player.position}</p>
        <p>Matches: ${player.matches || 0} | Goals: ${player.goals || 0} | Assists: ${player.assists || 0}</p>
        <button onclick="startEditTeamPlayer(${player.id})" class="edit-btn">Edit</button>
        <button onclick="deleteTeamPlayer(${player.id})" class="delete-btn">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

window.startEditTeamPlayer = async function(id) {
  const pass = prompt("Enter Admin Password:");
  if (pass !== "wiseeagle") return alert("Wrong Password");

  const { data: player, error } = await supabaseClient
    .from("team_players")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !player) return alert("Player not found");

  editingTeamPlayerId = id;

  document.getElementById("teamPlayerName").value = player.name;
  document.getElementById("teamPlayerPosition").value = player.position;
  document.getElementById("teamPlayerMatches").value = player.matches || 0;
  document.getElementById("teamPlayerGoals").value = player.goals || 0;
  document.getElementById("teamPlayerAssists").value = player.assists || 0;
  document.getElementById("teamPlayerBio").value = player.bio || "";
  document.getElementById("teamPlayerHighlights").value = player.highlights || "";
  document.getElementById("teamPlayerStrengths").value = player.strengths || "";

  if (player.image) {
    document.getElementById("teamImagePreview").src = player.image;
    document.getElementById("teamImagePreview").style.display = "block";
    teamImageBase64 = player.image;
  }

  document.getElementById("teamSubmitBtn").textContent = "Update Team Player";
};

window.deleteTeamPlayer = async function(id) {
  const pass = prompt("Enter DELETE Password (yeshua):");
  if (pass !== "yeshua") return alert("Wrong Password");

  if (!confirm("Delete this player?")) return;

  const { error } = await supabaseClient
    .from("team_players")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete");
    return;
  }

  alert("Player deleted");
  loadTeamPlayers();
};

// Make sure showTab still works
window.showTab = function(n) {
  document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const tab = document.getElementById('tab' + n);
  if (tab) tab.classList.add('active');

  const buttons = document.querySelectorAll('.tab-btn');
  if (buttons[n]) buttons[n].classList.add('active');
};

// Load when page opens
document.addEventListener("DOMContentLoaded", function() {
  loadTeamPlayers();
});







// ====================== MATCHES MANAGEMENT (SUPABASE) ======================

let homeLogoBase64 = "";
let awayLogoBase64 = "";

// Load Matches
async function loadAdminMatches() {
  const container = document.getElementById("matchesList");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center; padding:30px;">Loading matches...</p>`;

  const { data: matches, error } = await supabaseClient
    .from("matches")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to load matches</p>`;
    return;
  }

  container.innerHTML = "";

  if (!matches || matches.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:50px; color:#666;">No matches added yet.</p>`;
    return;
  }

  matches.forEach(match => {
    const div = document.createElement("div");
    div.className = "match-item";
    div.innerHTML = `
      <div>
        <strong>${match.date} ${match.time ? "• " + match.time : ""}</strong><br>
        ${match.home_team} vs ${match.away_team} 
        <strong>${match.score || "VS"}</strong><br>
        ${match.competition} @ ${match.venue}
      </div>
      <div>
        <button onclick="startEditMatch(${match.id})">Edit</button>
        <button onclick="deleteMatch(${match.id})" style="background:#e74c3c; color:white;">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Start Edit
window.startEditMatch = async function (id) {
  const pass = prompt("Enter Admin Password:");
  if (pass !== "wiseeagle") return alert("❌ Wrong Password");

  const { data: match, error } = await supabaseClient
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !match) return alert("Match not found");

  editingMatchId = id;

  document.getElementById("matchDate").value = match.date;
  document.getElementById("matchTime").value = match.time || "";
  document.getElementById("matchCompetition").value = match.competition || "";
  document.getElementById("homeTeam").value = match.home_team || "United FC";
  document.getElementById("awayTeam").value = match.away_team || "";
  document.getElementById("matchScore").value = match.score || "";
  document.getElementById("matchVenue").value = match.venue || "";

  homeLogoBase64 = match.home_logo || "";
  awayLogoBase64 = match.away_logo || "";

  document.getElementById("matchSubmitBtn").textContent = "Update Match";
};

// Delete Match
window.deleteMatch = async function (id) {
  const pass = prompt("Enter DELETE Password:");
  if (pass !== "yeshua") return alert("❌ Wrong Password");

  if (!confirm("Delete this match permanently?")) return;

  const { error } = await supabaseClient
    .from("matches")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete match");
    console.error(error);
    return;
  }

  alert("✅ Match deleted");
  loadAdminMatches();
};

// Form Submit
const matchForm = document.getElementById("matchForm");
if (matchForm) {
  matchForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const pass = prompt("Enter Admin Password:");
    if (pass !== "wiseeagle") return alert("❌ Wrong Password");

    const matchData = {
      date: document.getElementById("matchDate").value,
      time: document.getElementById("matchTime").value || null,
      competition: document.getElementById("matchCompetition").value.trim(),
      home_team: document.getElementById("homeTeam").value.trim(),
      away_team: document.getElementById("awayTeam").value.trim(),
      score: document.getElementById("matchScore").value.trim() || null,
      venue: document.getElementById("matchVenue").value.trim(),
      home_logo: homeLogoBase64 || null,
      away_logo: awayLogoBase64 || null
    };

    let result;

    if (editingMatchId) {
      result = await supabaseClient
        .from("matches")
        .update(matchData)
        .eq("id", editingMatchId);
    } else {
      result = await supabaseClient
        .from("matches")
        .insert([matchData]);
    }

    if (result.error) {
      console.error(result.error);
      alert("❌ Error: " + result.error.message);
      return;
    }

    alert(editingMatchId ? "✅ Match updated!" : "✅ New Match added!");

    // Reset
    matchForm.reset();
    editingMatchId = null;
    homeLogoBase64 = "";
    awayLogoBase64 = "";
    document.getElementById("matchSubmitBtn").textContent = "Add Match";

    loadAdminMatches();
  });
}

// Make sure showTab still works
window.showTab = function(n) {
  document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const tab = document.getElementById('tab' + n);
  if (tab) tab.classList.add('active');

  const buttons = document.querySelectorAll('.tab-btn');
  if (buttons[n]) buttons[n].classList.add('active');
};

// Logo handling + Load on start
document.addEventListener("DOMContentLoaded", () => {
  const homeLogoInput = document.getElementById("homeLogo");
  const awayLogoInput = document.getElementById("awayLogo");

  if (homeLogoInput) {
    homeLogoInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => homeLogoBase64 = e.target.result;
        reader.readAsDataURL(file);
      }
    });
  }

  if (awayLogoInput) {
    awayLogoInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => awayLogoBase64 = e.target.result;
        reader.readAsDataURL(file);
      }
    });
  }

  loadAdminMatches();
});














// ====================== VIDEOS MANAGEMENT (SUPABASE) ======================

// Load Videos
async function loadVideos() {
  const container = document.getElementById("vidList");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center; padding:40px;">Loading videos...</p>`;

  const { data: videos, error } = await supabaseClient
    .from("videos")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to load videos</p>`;
    return;
  }

  container.innerHTML = "";

  if (!videos || videos.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:60px; color:#666;">No videos added yet.</p>`;
    return;
  }

  videos.forEach(video => {
    const div = document.createElement("div");
    div.className = "video-item";
    div.innerHTML = `
      <img src="${video.thumbnail || 'images/default-video.jpg'}" alt="${video.title}">
      <div class="video-info">
        <h4>${video.title}</h4>
        <p>${video.date || ''}</p>
        <p style="font-size:0.9rem; color:#666;">
          ${video.description ? video.description.substring(0, 90) + '...' : ''}
        </p>
        <button onclick="deleteVideo(${video.id})" style="background:#e74c3c; color:white; padding:6px 12px; border:none; border-radius:6px; margin-top:8px;">
          Delete
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Delete Video
window.deleteVideo = async function (id) {
  const pass = prompt("Enter DELETE Password:");
  if (pass !== "yeshua") return alert("❌ Wrong Password");

  if (!confirm("Delete this video permanently?")) return;

  const { error } = await supabaseClient
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete video");
    console.error(error);
    return;
  }

  alert("✅ Video deleted");
  loadVideos();
};

// Form Submit
const vidForm = document.getElementById("vidForm");
if (vidForm) {
  vidForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const pass = prompt("Enter Admin Password:");
    if (pass !== "wiseeagle") return alert("❌ Wrong Password");

    const title = document.getElementById("vidTitle").value.trim();
    if (!title) return alert("Video Title is required!");

    const videoFileInput = document.getElementById("vidFile");
    if (!videoFileInput.files[0] && !editingVideoId) {
      return alert("Please upload an actual video file!");
    }

    if (videoFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async function (ev) {
        videoFileBase64 = ev.target.result;
        await saveVideo(title);
      };
      reader.readAsDataURL(videoFileInput.files[0]);
    } else {
      await saveVideo(title);
    }
  });
}

async function saveVideo(title) {
  const videoData = {
    title: title,
    url: document.getElementById("vidUrl").value.trim() || null,
    video_file: videoFileBase64 || null,
    thumbnail: videoThumbnailBase64 || null,
    date: document.getElementById("vidDate").value,
    description: document.getElementById("vidDescription").value.trim() || null
  };

  let result;

  if (editingVideoId) {
    result = await supabaseClient
      .from("videos")
      .update(videoData)
      .eq("id", editingVideoId);
  } else {
    result = await supabaseClient
      .from("videos")
      .insert([videoData]);
  }

  if (result.error) {
    console.error(result.error);
    alert("❌ Error: " + result.error.message);
    return;
  }

  alert(editingVideoId ? "✅ Video updated!" : "✅ Video added successfully!");

  // Reset
  document.getElementById("vidForm").reset();
  editingVideoId = null;
  videoThumbnailBase64 = "";
  videoFileBase64 = "";
  document.getElementById("vidThumbnailPreview").style.display = "none";
  document.getElementById("vidSubmitBtn").textContent = "Add Video";

  loadVideos();
}

// Make sure showTab works
window.showTab = function(n) {
  document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const tab = document.getElementById('tab' + n);
  if (tab) tab.classList.add('active');

  const buttons = document.querySelectorAll('.tab-btn');
  if (buttons[n]) buttons[n].classList.add('active');
};

// Thumbnail Preview + Load
document.addEventListener("DOMContentLoaded", () => {
  const videoThumbnailInput = document.getElementById("vidThumbnail");
  if (videoThumbnailInput) {
    videoThumbnailInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          videoThumbnailBase64 = e.target.result;
          document.getElementById("vidThumbnailPreview").src = videoThumbnailBase64;
          document.getElementById("vidThumbnailPreview").style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  loadVideos();
});














// ====================== TRIAL APPLICATIONS (SUPABASE) ======================

async function loadTrialApplications() {
  const container = document.getElementById("trialApplicationsList") || document.getElementById("applicationsList");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center; padding:40px;">Loading applications...</p>`;

  const { data: applications, error } = await supabaseClient
    .from("trial_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<p style="color:red; text-align:center;">Failed to load applications</p>`;
    return;
  }

  container.innerHTML = "";

  if (!applications || applications.length === 0) {
    container.innerHTML = `<p style="text-align:center; padding:60px; color:#666;">No trial applications yet.</p>`;
    return;
  }

  applications.forEach(app => {
    const div = document.createElement("div");
    div.className = "trial-card";
    div.style.cssText = "background:white; padding:20px; border-radius:12px; margin-bottom:15px; box-shadow:0 4px 12px rgba(0,0,0,0.08);";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; gap:15px;">
        <div>
          <h4 style="margin:0 0 8px 0; color:#0b2c8f;">${app.full_name}</h4>
          <p style="margin:4px 0; font-size:0.95rem;"><strong>Position:</strong> ${app.position || 'N/A'}</p>
          <p style="margin:4px 0; font-size:0.95rem;"><strong>Email:</strong> ${app.email || 'N/A'}</p>
          <p style="margin:4px 0; font-size:0.95rem;"><strong>Phone:</strong> ${app.phone || 'N/A'}</p>
          <p style="margin:4px 0; font-size:0.95rem;"><strong>Status:</strong> 
            <span style="color:${app.status === 'Approved' ? 'green' : app.status === 'Rejected' ? 'red' : '#e67e22'}">
              ${app.status || 'Pending'}
            </span>
          </p>
          ${app.message ? `<p style="margin:10px 0 0; font-size:0.9rem; color:#555;"><em>"${app.message}"</em></p>` : ''}
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button onclick="updateTrialStatus(${app.id}, 'Approved')" style="background:#27ae60; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Approve</button>
          <button onclick="updateTrialStatus(${app.id}, 'Rejected')" style="background:#e74c3c; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Reject</button>
          <button onclick="deleteTrial(${app.id})" style="background:#7f8c8d; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

window.updateTrialStatus = async function(id, status) {
  const pass = prompt("Enter Admin Password:");
  if (pass !== "wiseeagle") return alert("❌ Wrong Password");

  const { error } = await supabaseClient
    .from("trial_applications")
    .update({ status: status })
    .eq("id", id);

  if (error) {
    alert("Failed to update status");
    return;
  }

  alert(`✅ Application marked as ${status}`);
  loadTrialApplications();
};

window.deleteTrial = async function(id) {
  const pass = prompt("Enter DELETE Password:");
  if (pass !== "yeshua") return alert("❌ Wrong Password");

  if (!confirm("Delete this application permanently?")) return;

  const { error } = await supabaseClient
    .from("trial_applications")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Failed to delete");
    return;
  }

  alert("✅ Application deleted");
  loadTrialApplications();
};

// Load when Admin page opens
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("trialApplicationsList") || document.getElementById("applicationsList")) {
    loadTrialApplications();
  }
});



















// ====================== TEAM PLAYER FORM SUBMIT (SUPABASE) ======================

const teamPlayerForm = document.getElementById("teamPlayerForm");

if (teamPlayerForm) {
  teamPlayerForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Very important - stops the page from jumping

    const pass = prompt("Enter Admin Password (wiseeagle):");
    if (pass !== "wiseeagle") {
      alert("❌ Wrong Password");
      return;
    }

    const playerData = {
      name: document.getElementById("teamPlayerName").value.trim(),
      position: document.getElementById("teamPlayerPosition").value.trim(),
      matches: parseInt(document.getElementById("teamPlayerMatches").value) || 0,
      goals: parseInt(document.getElementById("teamPlayerGoals").value) || 0,
      assists: parseInt(document.getElementById("teamPlayerAssists").value) || 0,
      bio: document.getElementById("teamPlayerBio").value.trim(),
      highlights: document.getElementById("teamPlayerHighlights").value.trim(),
      strengths: document.getElementById("teamPlayerStrengths").value.trim(),
      image: teamImageBase64 || "images/default-player.png"
    };

    let result;

    if (editingTeamPlayerId) {
      // Update existing player
      result = await supabaseClient
        .from("team_players")
        .update(playerData)
        .eq("id", editingTeamPlayerId);
    } else {
      // Add new player
      result = await supabaseClient
        .from("team_players")
        .insert([playerData]);
    }

    if (result.error) {
      console.error(result.error);
      alert("❌ Error: " + result.error.message);
      return;
    }

    alert(editingTeamPlayerId ? "✅ Player updated successfully!" : "✅ New Player added successfully!");

    // Reset form
    teamPlayerForm.reset();
    teamImageBase64 = "";
    document.getElementById("teamImagePreview").style.display = "none";
    editingTeamPlayerId = null;
    document.getElementById("teamSubmitBtn").textContent = "Add Team Player";

    // Reload the list
    loadTeamPlayers();
  });
}