// js/player.js - Now using Supabase

async function loadPlayerProfile() {
  const params = new URLSearchParams(window.location.search);
  const playerId = parseInt(params.get("id"));

  if (!playerId) {
    showPlayerNotFound();
    return;
  }

  try {
    const { data: player, error } = await supabaseClient
      .from("team_players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (error || !player) {
      showPlayerNotFound();
      return;
    }

    // Fill the page
    document.getElementById("playerImage").src = player.image || "images/default-player.png";
    document.getElementById("playerName").textContent = player.name;
    document.getElementById("playerPosition").textContent = player.position;
    document.getElementById("matches").textContent = player.matches || 0;
    document.getElementById("goals").textContent = player.goals || 0;
    document.getElementById("assists").textContent = player.assists || 0;
    document.getElementById("playerBio").textContent = player.bio || "No biography available yet.";

    // Highlights & Strengths
    document.getElementById("playerHighlights").innerHTML = player.highlights
      ? player.highlights.replace(/\n/g, "<br>")
      : "No highlights added yet.";

    document.getElementById("playerStrengths").textContent = player.strengths
      ? player.strengths
      : "No strengths added yet.";

  } catch (err) {
    console.error(err);
    showPlayerNotFound();
  }
}

function showPlayerNotFound() {
  document.getElementById("playerName").textContent = "Player Not Found";
  document.getElementById("playerPosition").textContent = "";
  document.getElementById("playerImage").src = "images/default-player.png";
  document.getElementById("matches").textContent = "0";
  document.getElementById("goals").textContent = "0";
  document.getElementById("assists").textContent = "0";
  document.getElementById("playerBio").textContent = "Sorry, no information available for this player.";
  document.getElementById("playerHighlights").textContent = "No highlights available.";
  document.getElementById("playerStrengths").textContent = "No strengths available.";
}

// Run when page loads
document.addEventListener("DOMContentLoaded", loadPlayerProfile);