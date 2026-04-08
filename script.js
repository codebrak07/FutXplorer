const API_KEYS = [
  "6a5be7d9b3a9cc80a27d739a4097684b",
  "69c0582de4e07ee759ecb0dbde59287c",
  "1509d5bc8a24bb61a714137e58415829",
  "38bdff2227832f2dff2c0d4d70bfbb1e"
];
let currentKeyIndex = 0;
let activeSearchId = 0;
const BASE_URL = "https://v3.football.api-sports.io";
const SEASON = "2025";
const SEARCH_LEAGUES = [307, 253, 39, 140, 135, 78, 61]; 
const LIFETIME_SEASONS = ["2025", "2024", "2023"];

let allPlayers = [];
let favorites = JSON.parse(localStorage.getItem("futFavs")) || [];
let searchTimeout = null;

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");
const resultsSection = document.getElementById("resultsSection");
const emptyBox = document.getElementById("emptyBox");
const controls = document.getElementById("controls");
const themeToggle = document.getElementById("themeToggle");

const posFilter = document.getElementById("posFilter");
const leagueFilter = document.getElementById("leagueFilter");
const natFilter = document.getElementById("natFilter");
const sortBy = document.getElementById("sortBy");

function showLoader() {
  loader.classList.remove("hidden");
  errorBox.classList.add("hidden");
  resultsSection.classList.add("hidden");
  emptyBox.classList.add("hidden");
  controls.classList.add("hidden");
  resultsSection.innerHTML = "";
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
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

function toggleFavorite(playerId) {
  const index = favorites.indexOf(playerId);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(playerId);
  }
  localStorage.setItem("futFavs", JSON.stringify(favorites));
  applyFiltersAndSort();
}

function buildCard(entry, index) {
  const p = entry.player;
  const stats = entry.statistics;

  const goals = getLifetimeStat(stats, "goals", "total");
  const assists = getLifetimeStat(stats, "goals", "assists");
  const apps = getLifetimeStat(stats, "games", "appearences");
  const ratingSum = getLifetimeStat(stats, "games", "rating");
  const ratingCount = stats ? stats.filter(function (s) { return s?.games?.rating; }).length : 0;
  const rating = ratingCount > 0 ? (ratingSum / ratingCount) : 0;
  
  const team = stats?.[0]?.team?.name || "—";
  const teamLogo = stats?.[0]?.team?.logo || "";
  const league = stats?.[0]?.league?.name || "—";
  const position = stats?.[0]?.games?.position || "—";
  const nationality = p.nationality || "—";
  
  const isFav = favorites.includes(p.id);

  const card = document.createElement("div");
  card.classList.add("player-card");
  card.style.animationDelay = `${index * 0.07}s`;

  const favBtn = document.createElement("button");
  favBtn.classList.add("fav-btn");
  if (isFav) favBtn.classList.add("active");
  favBtn.innerHTML = "❤️";
  favBtn.onclick = function(e) {
    e.stopPropagation();
    toggleFavorite(p.id);
  };

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

  detailsDiv.appendChild(nameEl);
  detailsDiv.appendChild(posEl);
  detailsDiv.appendChild(natEl);
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
    { num: goals, label: "Total Goals" },
    { num: assists, label: "Total Assists" },
    { num: apps, label: "Total matches" },
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
    { label: "Age", value: p.age || "—" },
    { label: "Rating", value: rating > 0 ? rating.toFixed(2) : "—" },
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

  card.appendChild(favBtn);
  card.appendChild(banner);
  card.appendChild(identity);
  card.appendChild(clubRow);
  card.appendChild(statsGrid);
  card.appendChild(bio);

  return card;
}

function updateFilterOptions() {
  const leagues = [...new Set(allPlayers.map(p => p.statistics[0]?.league?.name).filter(Boolean))];
  const nationalities = [...new Set(allPlayers.map(p => p.player.nationality).filter(Boolean))];

  leagueFilter.innerHTML = '<option value="">All Leagues</option>';
  leagues.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    leagueFilter.appendChild(opt);
  });

  natFilter.innerHTML = '<option value="">All Nationalities</option>';
  nationalities.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    natFilter.appendChild(opt);
  });
}

function applyFiltersAndSort() {
  const posValue = posFilter.value;
  const leagueValue = leagueFilter.value;
  const natValue = natFilter.value;
  const sortValue = sortBy.value;

  const filtered = allPlayers.filter(function(entry) {
    const matchesPos = !posValue || (entry.statistics[0]?.games?.position || "").includes(posValue);
    const matchesLeague = !leagueFilter.value || entry.statistics[0]?.league?.name === leagueValue;
    const matchesNat = !natFilter.value || entry.player.nationality === natValue;
    return matchesPos && matchesLeague && matchesNat;
  });

  filtered.sort(function(a, b) {
    if (sortValue === "goals") {
      return getLifetimeStat(b.statistics, "goals", "total") - getLifetimeStat(a.statistics, "goals", "total");
    }
    if (sortValue === "assists") {
      return getLifetimeStat(b.statistics, "goals", "assists") - getLifetimeStat(a.statistics, "goals", "assists");
    }
    if (sortValue === "appearences") {
      return getLifetimeStat(b.statistics, "games", "appearences") - getLifetimeStat(a.statistics, "games", "appearences");
    }
    if (sortValue === "rating") {
      const rA = getLifetimeStat(a.statistics, "games", "rating") / (a.statistics.filter(s => s?.games?.rating).length || 1);
      const rB = getLifetimeStat(b.statistics, "games", "rating") / (b.statistics.filter(s => s?.games?.rating).length || 1);
      return rB - rA;
    }
    return 0;
  });

  resultsSection.innerHTML = "";
  if (filtered.length === 0) {
    emptyBox.classList.remove("hidden");
  } else {
    emptyBox.classList.add("hidden");
    filtered.map(function(entry, i) {
      resultsSection.appendChild(buildCard(entry, i));
    });
  }
}

async function apiFetch(url, searchId) {
  if (searchId && searchId !== activeSearchId) return null;
  
  const cached = sessionStorage.getItem(url);
  if (cached) return JSON.parse(cached);

  const key = API_KEYS[currentKeyIndex];
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-apisports-key": key },
    });

    if (res.status === 429 || res.status === 403) {
      if (currentKeyIndex < API_KEYS.length - 1) {
        currentKeyIndex++;
        return await apiFetch(url, searchId);
      }
      throw new Error("LIMIT_REACHED");
    }

    const data = await res.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      const err = JSON.stringify(data.errors).toLowerCase();
      if (err.includes("limit") || err.includes("requests") || err.includes("account")) {
        if (currentKeyIndex < API_KEYS.length - 1) {
          currentKeyIndex++;
          return await apiFetch(url, searchId);
        }
        throw new Error("LIMIT_REACHED");
      }
    }
    
    if (data && data.response && data.response.length > 0) {
      sessionStorage.setItem(url, JSON.stringify(data));
    }
    return data;
  } catch (err) {
    if (err.message === "LIMIT_REACHED") throw err;
    return { response: [] };
  }
}

async function searchPlayers(query) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return;

  const currentId = ++activeSearchId;
  showLoader();
  allPlayers = [];
  currentKeyIndex = 0;

  async function searchRecursively(leagueIdx, pool) {
    if (leagueIdx >= SEARCH_LEAGUES.length || currentId !== activeSearchId || pool.length >= 5) {
      return pool;
    }
    const leagueId = SEARCH_LEAGUES[leagueIdx];
    const data = await apiFetch(`${BASE_URL}/players?search=${encodeURIComponent(trimmed)}&league=${leagueId}`, currentId);
    if (data && data.response && data.response.length > 0) {
      pool = pool.concat(data.response);
    }
    await new Promise(r => setTimeout(r, 2000));
    return searchRecursively(leagueIdx + 1, pool);
  }

  async function fetchStatsRecursively(players, pIdx, sIdx, statsAcc) {
    if (currentId !== activeSearchId || pIdx >= players.length) return;
    const p = players[pIdx];

    if (sIdx >= LIFETIME_SEASONS.length) {
      allPlayers.push({ player: p.player, statistics: statsAcc });
      return fetchStatsRecursively(players, pIdx + 1, 0, []);
    }

    await new Promise(r => setTimeout(r, 1200));
    const d = await apiFetch(`${BASE_URL}/players?id=${p.player.id}&season=${LIFETIME_SEASONS[sIdx]}`, currentId);
    if (d && d.response && d.response.length > 0) {
      statsAcc.push.apply(statsAcc, d.response[0].statistics);
    }
    return fetchStatsRecursively(players, pIdx, sIdx + 1, statsAcc);
  }

  try {
    const rawPool = await searchRecursively(0, []);
    const uniquePool = rawPool.filter((v, i, a) => a.findIndex(t => t.player.id === v.player.id) === i).slice(0, 3);
    
    if (uniquePool.length > 0) {
      await fetchStatsRecursively(uniquePool, 0, 0, []);
    }

    if (currentId !== activeSearchId) return;
    hideLoader();
    if (allPlayers.length === 0) {
      emptyBox.classList.remove("hidden");
    } else {
      controls.classList.remove("hidden");
      resultsSection.classList.remove("hidden");
      updateFilterOptions();
      applyFiltersAndSort();
    }
  } catch (err) {
    if (currentId === activeSearchId) {
      hideLoader();
      const msg = err.message === "LIMIT_REACHED" ? "All API limits reached. Try again in 1 minute." : "Something went wrong.";
      showError(msg);
    }
  }
}

function handleInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchPlayers(searchInput.value);
  }, 1000);
}

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-mode");
  localStorage.setItem("futTheme", isLight ? "light" : "dark");
  themeToggle.textContent = isLight ? "🌙" : "🌓";
}

if (localStorage.getItem("futTheme") === "light") {
  document.body.classList.add("light-mode");
  themeToggle.textContent = "🌙";
}

searchInput.addEventListener("input", handleInput);
searchBtn.addEventListener("click", () => {
  clearTimeout(searchTimeout);
  searchPlayers(searchInput.value);
});
themeToggle.addEventListener("click", toggleTheme);
[posFilter, leagueFilter, natFilter, sortBy].forEach(el => {
  el.addEventListener("change", applyFiltersAndSort);
});