// js/dashboard.js - Fully Synced with Admin Page

// Load players from localStorage (shared with Admin)
let allPlayers = JSON.parse(localStorage.getItem("allPlayers")) || [
    { id: 1, name: "Ephraim", position: "Forward", appearances: 12, minutesPlayed: 980, goals: 8, assists: 3, yellowCards: 2, redCards: 0, injury: "None", recovery: "N/A" },
    { id: 2, name: "Josh Yeshua", position: "Forward", appearances: 15, minutesPlayed: 1240, goals: 6, assists: 9, yellowCards: 1, redCards: 0, injury: "None", recovery: "N/A" },
    { id: 3, name: "Isaiah", position: "Defender", appearances: 18, minutesPlayed: 1580, goals: 1, assists: 4, yellowCards: 4, redCards: 1, injury: "Hamstring Strain", recovery: "Expected Return: 18 May 2026" }
];

// Dynamic Rating Formula
function calculateRating(player) {
    let base = 6.0;
    base += (player.goals * 0.45) + (player.assists * 0.35);
    base += (player.minutesPlayed / 90) * 0.08;
    base -= (player.yellowCards * 0.12);
    base -= (player.redCards * 0.8);
    return Math.min(9.5, Math.max(5.5, parseFloat(base.toFixed(1))));
}

// Apply ratings
allPlayers.forEach(p => p.rating = calculateRating(p));

// Update Overview Stats
function updateOverview() {
    const totalPlayers = allPlayers.length;
    const totalGoals = allPlayers.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = allPlayers.reduce((sum, p) => sum + p.assists, 0);
    const totalMinutes = allPlayers.reduce((sum, p) => sum + p.minutesPlayed, 0);

    document.getElementById("totalPlayers").textContent = totalPlayers;
    document.getElementById("totalGoals").textContent = totalGoals;
    document.getElementById("totalAssists").textContent = totalAssists;
    document.getElementById("totalMatches").textContent = Math.round(totalMinutes / 90);
}

// Populate Ranking Table
function populateRankingTable(players) {
    const tbody = document.getElementById("rankingBody");
    tbody.innerHTML = "";

    players.forEach(player => {
        const injuryHTML = player.injury === "None" 
            ? `<span style="color:green;">✓ Fit</span>` 
            : `<span style="color:#d32f2f;">${player.injury}</span>`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${player.name}</strong></td>
            <td>${player.position}</td>
            <td>${player.appearances}</td>
            <td>${player.minutesPlayed}</td>
            <td>${player.goals}</td>
            <td>${player.assists}</td>
            <td>${player.yellowCards}</td>
            <td>${player.redCards}</td>
            <td>${injuryHTML}</td>
            <td><strong>${player.rating}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Sort Rankings
function sortRankings() {
    const sortBy = document.getElementById("sortBy").value;
    const searchTerm = document.getElementById("searchRanking").value.toLowerCase().trim();

    let filtered = allPlayers.filter(p => p.name.toLowerCase().includes(searchTerm));

    if (sortBy === "goals") filtered.sort((a, b) => b.goals - a.goals);
    else if (sortBy === "assists") filtered.sort((a, b) => b.assists - a.assists);
    else if (sortBy === "appearances") filtered.sort((a, b) => b.appearances - a.appearances);
    else if (sortBy === "minutes") filtered.sort((a, b) => b.minutesPlayed - a.minutesPlayed);
    else if (sortBy === "yellow") filtered.sort((a, b) => b.yellowCards - a.yellowCards);
    else filtered.sort((a, b) => b.rating - a.rating);

    populateRankingTable(filtered);
}

// Player Comparison
function comparePlayers() {
    const p1Id = parseInt(document.getElementById("player1").value);
    const p2Id = parseInt(document.getElementById("player2").value);

    const p1 = allPlayers.find(p => p.id === p1Id);
    const p2 = allPlayers.find(p => p.id === p2Id);

    if (!p1 || !p2) return;

    const result = document.getElementById("comparisonResult");
    result.innerHTML = `
        <div class="comparison-grid">
            <div class="compare-player">
                <h3>${p1.name}</h3>
                <p>Apps: ${p1.appearances} | Mins: ${p1.minutesPlayed}<br>
                   Goals: ${p1.goals} | Assists: ${p1.assists}<br>
                   Yellow: ${p1.yellowCards} | Red: ${p1.redCards}<br>
                   <strong>Rating: ${p1.rating}</strong></p>
            </div>
            <div class="vs">VS</div>
            <div class="compare-player">
                <h3>${p2.name}</h3>
                <p>Apps: ${p2.appearances} | Mins: ${p2.minutesPlayed}<br>
                   Goals: ${p2.goals} | Assists: ${p2.assists}<br>
                   Yellow: ${p2.yellowCards} | Red: ${p2.redCards}<br>
                   <strong>Rating: ${p2.rating}</strong></p>
            </div>
        </div>
    `;
}

// Populate Comparison Dropdowns
function populateCompareSelects() {
    const select1 = document.getElementById("player1");
    const select2 = document.getElementById("player2");
    select1.innerHTML = "";
    select2.innerHTML = "";

    allPlayers.forEach(player => {
        const opt1 = new Option(player.name, player.id);
        const opt2 = new Option(player.name, player.id);
        select1.add(opt1);
        select2.add(opt2);
    });
}

// Initialize Charts
function initCharts() {
    const ctx1 = document.getElementById("statsChart");
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: allPlayers.map(p => p.name),
                datasets: [
                    { label: 'Goals', data: allPlayers.map(p => p.goals), backgroundColor: '#0b2c8f' },
                    { label: 'Assists', data: allPlayers.map(p => p.assists), backgroundColor: '#00aaff' }
                ]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true }}}
        });
    }

    const ctx2 = document.getElementById("positionChart");
    if (ctx2) {
        const positions = {};
        allPlayers.forEach(p => positions[p.position] = (positions[p.position] || 0) + 1);

        new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: Object.keys(positions),
                datasets: [{ 
                    data: Object.values(positions), 
                    backgroundColor: ['#0b2c8f', '#00aaff', '#ff8800', '#22cc88'] 
                }]
            },
            options: { responsive: true }
        });
    }
}

// Injury Overview
function renderInjuryOverview() {
    const container = document.getElementById("injuryGrid");
    if (!container) return;

    container.innerHTML = "";

    const injuredPlayers = allPlayers.filter(p => p.injury !== "None");

    if (injuredPlayers.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:40px; color:green; font-size:1.1rem;">All players are currently fit ✅</p>`;
        return;
    }

    injuredPlayers.forEach(player => {
        const div = document.createElement("div");
        div.className = "injury-card";
        div.innerHTML = `
            <strong>${player.name}</strong>
            <p>${player.position}</p>
            <p style="color:#d32f2f; font-weight:600;">${player.injury}</p>
            <p style="color:#d35400; margin-top:8px;"><strong>Recovery:</strong> ${player.recovery}</p>
        `;
        container.appendChild(div);
    });
}

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateOverview();
    populateRankingTable(allPlayers);
    populateCompareSelects();
    initCharts();
    renderInjuryOverview();

    document.getElementById("sortBy").addEventListener("change", sortRankings);
    document.getElementById("searchRanking").addEventListener("input", sortRankings);
});


