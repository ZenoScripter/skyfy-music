let player;
let playerReady = false;
let currentId = "";
let currentTrack = null;
let queue = [];
let queueIndex = 0;
let favorites = JSON.parse(localStorage.getItem("skyfy-favorites") || "[]");

const $ = id => document.getElementById(id);
const status = $("status");
const results = $("results");

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("ytPlayer", {
    width: "100%",
    height: "220",
    videoId: "",
    playerVars: { playsinline: 1, rel: 0 },
    events: {
      onReady: () => { playerReady = true; },
      onStateChange: event => {
        $("playPause").textContent = event.data === YT.PlayerState.PLAYING ? "Ⅱ" : "▶";
      }
    }
  });
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

async function searchSongs(query) {
  status.textContent = "Searching the music multiverse…";
  results.innerHTML = "";
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Search failed");
    queue = data;
    queueIndex = 0;
    if (!data.length) {
      status.textContent = "No results found. Try another search.";
      return;
    }
    status.textContent = `${data.length} tracks found. Pick one to play.`;
    renderTracks(data, results);
  } catch (error) {
    status.textContent = error.message || "Couldn't search right now.";
  }
}

function renderTracks(tracks, target) {
  target.innerHTML = tracks.map((track, index) => {
    const saved = favorites.some(item => item.videoId === track.videoId);
    return `<article class="track">
      <img src="${esc(track.thumbnail)}" alt="" loading="lazy">
      <div class="track-info"><b>${esc(track.title)}</b><small>${esc(track.artist)}</small></div>
      <button class="play-track" data-play="${index}" aria-label="Play">▶</button>
      <button class="fav ${saved ? "saved" : ""}" data-fav="${esc(track.videoId)}" title="Favorite">${saved ? "★" : "☆"}</button>
    </article>`;
  }).join("");
  target.querySelectorAll("[data-play]").forEach(button => button.addEventListener("click", () => {
    const idx = Number(button.dataset.play);
    const track = tracks[idx];
    if (target === results) { queue = tracks; queueIndex = idx; }
    playTrack(track);
  }));
  target.querySelectorAll("[data-fav]").forEach(button => button.addEventListener("click", () => toggleFavorite(button.dataset.fav)));
}

function playTrack(track) {
  if (!playerReady || !track?.videoId) {
    status.textContent = "YouTube player is still loading. Try again in a moment.";
    return;
  }
  currentTrack = track;
  currentId = track.videoId;
  player.loadVideoById(track.videoId);
  $("nowTitle").textContent = track.title;
  $("nowArtist").textContent = track.artist;
  $("modalTrack").textContent = `${track.title} — ${track.artist}`;
  $("playerModal").classList.add("open");
}

function toggleFavorite(videoId) {
  const found = favorites.find(item => item.videoId === videoId);
  if (found) favorites = favorites.filter(item => item.videoId !== videoId);
  else {
    const track = queue.find(item => item.videoId === videoId) || lastTracks.find(item => item.videoId === videoId);
    if (track) favorites.push(track);
  }
  localStorage.setItem("skyfy-favorites", JSON.stringify(favorites));
  renderFavorites();
  if (queue.length) renderTracks(queue, results);
}
let lastTracks = [];

function renderFavorites() {
  $("favorites").style.display = favorites.length ? "none" : "block";
  renderTracks(favorites, $("favoriteList"));
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  const query = $("query").value.trim();
  if (query) searchSongs(query);
});
$("heroSearch").addEventListener("click", () => {
  $("query").focus();
  $("searchSection").scrollIntoView({ behavior: "smooth" });
});
document.querySelectorAll(".nav").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".nav").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  const view = button.dataset.view;
  if (view === "search") $("searchSection").scrollIntoView({ behavior: "smooth" });
  else if (view === "library") document.querySelector(".lower").scrollIntoView({ behavior: "smooth" });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}));
$("showPlayer").addEventListener("click", () => $("playerModal").classList.add("open"));
$("closePlayer").addEventListener("click", () => $("playerModal").classList.remove("open"));
$("playPause").addEventListener("click", () => {
  if (!playerReady || !currentId) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) player.pauseVideo();
  else player.playVideo();
});
$("next").addEventListener("click", () => {
  if (!queue.length) return;
  queueIndex = (queueIndex + 1) % queue.length;
  playTrack(queue[queueIndex]);
});
$("prev").addEventListener("click", () => {
  if (!queue.length) return;
  queueIndex = (queueIndex - 1 + queue.length) % queue.length;
  playTrack(queue[queueIndex]);
});
renderFavorites();
