// js/team.js - Now using Supabase

async function loadPlayers() {
  const container = document.getElementById("playerContainer");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center; padding:80px; color:#666; grid-column:1/-1;">Loading players...</p>`;

  try {
    const { data: teamPlayers, error } = await supabaseClient
      .from("team_players")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      container.innerHTML = `<p style="text-align:center; padding:80px; color:red;">Failed to load players.</p>`;
      return;
    }

    container.innerHTML = "";

    if (!teamPlayers || teamPlayers.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:100px; color:#666; grid-column:1/-1;">
        No players yet. Add players from the Admin Panel.
      </p>`;
      return;
    }

    teamPlayers.forEach(player => {
      const card = document.createElement("div");
      card.classList.add("player-card");

      card.innerHTML = `
        <img src="${player.image || 'images/default-player.png'}" class="player-img" alt="${player.name}">
        <div class="player-info">
          <h3>${player.name}</h3>
          <p>${player.position}</p>
        </div>
        <div class="stats-overlay">
          <p>Matches: ${player.matches || 0}</p>
          <p>Goals: ${player.goals || 0}</p>
          <p>Assists: ${player.assists || 0}</p>
        </div>
      `;

      card.onclick = () => {
        window.location.href = `player.html?id=${player.id}`;
      };

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="text-align:center; padding:80px; color:red;">Error loading players.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPlayers);