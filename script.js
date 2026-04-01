const API_KEYS = [
  "69c0582de4e07ee759ecb0dbde59287c",
  "1509d5bc8a24bb61a714137e58415829",
  "38bdff2227832f2dff2c0d4d70bfbb1e"
];
let currentKeyIndex = 0;
const BASE_URL = "https://v3.football.api-sports.io";
const SEASON = "2024";
const SEARCH_LEAGUES = [253, 307, 39, 140, 135, 78, 61];
const LIFETIME_SEASONS = ["2024", "2023", "2022"];

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const resultsSection = document.getElementById("resultsSection");
const emptyBox = document.getElementById("emptyBox");

function showLoader() {
  loader.classList.remove("hidden");
  errorBox.classList.add("hidden");
  resultsSection.classList.add("hidden");
  emptyBox.classList.add("hidden");
  resultsSection.innerHTML = "";
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function getStat(statistics, group, key) {
  if (!statistics || !statistics.length) return 0;
  return statistics[0]?.[group]?.[key] || 0;
}

function getLifetimeStat(statistics, group, key) {
  if (!statistics || !statistics.length) return 0;
  let total = 0;
  statistics.forEach(function (s) {
    let val = s?.[group]?.[key];
    if (val === null || val === undefined) return;
    if (typeof val === "string") val = parseFloat(val);
    if (!isNaN(val)) total += val;
  });
  return total;
}

function buildCard(entry, index) {
  const p = entry.player;
  const stats = entry.statistics;

  const goals = getLifetimeStat(stats, "goals", "total");
  const assists = getLifetimeStat(stats, "goals", "assists");
  const apps = getLifetimeStat(stats, "games", "appearences");
  const ratingSum = getLifetimeStat(stats, "games", "rating");
  const ratingCount = stats ? stats.filter(function (s) { return s?.games?.rating; }).length : 0;
  const rating = ratingCount > 0 ? (ratingSum / ratingCount) : null;
  const team = stats?.[0]?.team?.name || "—";
  const teamLogo = stats?.[0]?.team?.logo || "";
  const league = stats?.[0]?.league?.name || "—";
  const position = stats?.[0]?.games?.position || "—";
  const nationality = p.nationality || "—";
  const age = p.age || "—";
  const height = p.height || "—";
  const weight = p.weight || "—";

  const card = document.createElement("div");
  card.classList.add("player-card");
  card.style.animationDelay = `${index * 0.07}s`;

  const banner = document.createElement("div");
  banner.classList.add("card-banner");

  const identity = document.createElement("div");
  identity.classList.add("card-identity");

  const photo = document.createElement("img");
  photo.classList.add("player-photo");
  photo.src = p.photo || "";
  photo.alt = p.name;
  photo.onerror = function () {
    this.src = "https://media.api-sports.io/football/players/0.png";
  };

  const detailsDiv = document.createElement("div");
  detailsDiv.classList.add("player-details");

  const nameEl = document.createElement("div");
  nameEl.classList.add("player-name");
  nameEl.textContent = p.name;

  const posEl = document.createElement("div");
  posEl.classList.add("player-pos");
  posEl.textContent = position;

  const natEl = document.createElement("div");
  natEl.classList.add("player-nat");
  natEl.textContent = nationality;

  const yearsLabel = document.createElement("div");
  yearsLabel.style.fontSize = "10px";
  yearsLabel.style.color = "#00ffa3";
  yearsLabel.style.marginTop = "4px";
  yearsLabel.style.fontWeight = "600";
  yearsLabel.textContent = `STATS: ${LIFETIME_SEASONS[LIFETIME_SEASONS.length-1]} - ${LIFETIME_SEASONS[0]}`;

  detailsDiv.appendChild(nameEl);
  detailsDiv.appendChild(posEl);
  detailsDiv.appendChild(natEl);
  detailsDiv.appendChild(yearsLabel);
  identity.appendChild(photo);
  identity.appendChild(detailsDiv);

  const clubRow = document.createElement("div");
  clubRow.classList.add("card-club");

  const clubLogo = document.createElement("img");
  clubLogo.classList.add("club-logo");
  clubLogo.src = teamLogo;
  clubLogo.alt = team;
  clubLogo.onerror = function () { this.style.display = "none"; };

  const clubInfo = document.createElement("div");
  clubInfo.classList.add("club-info");

  const clubName = document.createElement("div");
  clubName.classList.add("club-name");
  clubName.textContent = team;

  const clubLeague = document.createElement("div");
  clubLeague.classList.add("club-league");
  clubLeague.textContent = league;

  clubInfo.appendChild(clubName);
  clubInfo.appendChild(clubLeague);
  clubRow.appendChild(clubLogo);
  clubRow.appendChild(clubInfo);

  const statsGrid = document.createElement("div");
  statsGrid.classList.add("card-stats");

  const statItems = [
    { num: goals, label: "Last 3 Sea. Goals" },
    { num: assists, label: "Last 3 Sea. Assists" },
    { num: apps, label: "Last 3 Sea. Matches" },
  ];

  statItems.forEach(function (item) {
    const cell = document.createElement("div");
    cell.classList.add("stat-cell");

    const numEl = document.createElement("div");
    numEl.classList.add("stat-num");
    numEl.textContent = item.num ?? 0;

    const labelEl = document.createElement("div");
    labelEl.classList.add("stat-label");
    labelEl.textContent = item.label;

    cell.appendChild(numEl);
    cell.appendChild(labelEl);
    statsGrid.appendChild(cell);
  });

  const bio = document.createElement("div");
  bio.classList.add("card-bio");

  const bioItems = [
    { label: "Age", value: age },
    { label: "Height", value: height },
    { label: "Weight", value: weight },
    { label: "Rating", value: rating ? rating.toFixed(1) : "—" },
  ];

  bioItems.forEach(function (item) {
    const bioItem = document.createElement("div");
    bioItem.classList.add("bio-item");

    const bioLabel = document.createElement("span");
    bioLabel.classList.add("bio-label");
    bioLabel.textContent = item.label;

    const bioVal = document.createElement("span");
    bioVal.classList.add("bio-value");
    bioVal.textContent = item.value;

    bioItem.appendChild(bioLabel);
    bioItem.appendChild(bioVal);
    bio.appendChild(bioItem);
  });

  card.appendChild(banner);
  card.appendChild(identity);
  card.appendChild(clubRow);
  card.appendChild(statsGrid);
  card.appendChild(bio);

  return card;
}

async function apiFetch(url) {
  const key = API_KEYS[currentKeyIndex];
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-apisports-key": key },
    });

    if (res.status === 429 || res.status === 403) {
      if (currentKeyIndex < API_KEYS.length - 1) {
        currentKeyIndex++;
        console.warn("Key fail/blocked, switching to next key...");
        return await apiFetch(url);
      }
    }

    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorStr = JSON.stringify(data.errors).toLowerCase();
      if (currentKeyIndex < API_KEYS.length - 1 && 
          (errorStr.includes("limit") || errorStr.includes("requests") || errorStr.includes("account") || errorStr.includes("access"))) {
        currentKeyIndex++;
        console.warn("Key error in data, switching to next key...");
        return await apiFetch(url);
      }
    }
    return data;
  } catch (err) {
    return { response: [] };
  }
}

async function searchPlayers(query) {
  const trimmed = query.trim();
  if (!trimmed) return;

  showLoader();
  currentKeyIndex = 0;

  try {
    let foundPlayer = null;
    for (let i = 0; i < SEARCH_LEAGUES.length; i++) {
      console.log("Searching league ID:", SEARCH_LEAGUES[i]);
      const data = await apiFetch(
        `${BASE_URL}/players?search=${encodeURIComponent(trimmed)}&season=${SEASON}&league=${SEARCH_LEAGUES[i]}`
      );
      
      if (data.response && data.response.length > 0) {
        foundPlayer = data.response[0];
        break;
      }
      // Wait 2 seconds between league searches to stay under 10 calls/min limit
      await new Promise(r => setTimeout(r, 2000));
    }

    if (!foundPlayer) {
      hideLoader();
      emptyBox.classList.remove("hidden");
      return;
    }

    const playerId = foundPlayer.player.id;
    const allStats = [];
    
    for (const season of LIFETIME_SEASONS) {
      // Wait between calls
      await new Promise(r => setTimeout(r, 2000));
      const data = await apiFetch(`${BASE_URL}/players?id=${playerId}&season=${season}`);
      if (data.response && data.response.length > 0) {
        allStats.push.apply(allStats, data.response[0].statistics);
      }
    }

    const playerEntry = {
      player: foundPlayer.player,
      statistics: allStats
    };

    hideLoader();
    if (allStats.length === 0) {
      emptyBox.classList.remove("hidden");
      return;
    }

    resultsSection.classList.remove("hidden");
    const card = buildCard(playerEntry, 0);
    resultsSection.appendChild(card);

  } catch (err) {
    hideLoader();
    showError("Something went wrong. Please try again in 1 minute.");
  }
}

searchBtn.addEventListener("click", function () {
  searchPlayers(searchInput.value);
});

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    searchPlayers(searchInput.value);
  }
});