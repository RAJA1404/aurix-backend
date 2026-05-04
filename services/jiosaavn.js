const JIOSAAVN_BASE_URL = 'https://jiosaavn-api-production-bee1.up.railway.app/api'; // Stable JioSaavn API host.
const ALLOWED_LANGUAGES = new Set(['tamil', 'english']); // Aurix online songs should stay Tamil + English only.

function pickBestUrl(downloadUrls = []) { // Pick the best playable audio URL.
  return (
    downloadUrls.find((item) => item.quality === '320kbps')?.url ||
    downloadUrls.find((item) => item.quality === '160kbps')?.url ||
    downloadUrls.find((item) => item.quality === '96kbps')?.url ||
    downloadUrls[downloadUrls.length - 1]?.url ||
    ''
  );
}

function pickArtwork(images = []) { // Pick the best available artwork image.
  return (
    images.find((item) => item.quality === '500x500')?.url ||
    images.find((item) => item.quality === '150x150')?.url ||
    images[images.length - 1]?.url ||
    ''
  );
}

function getArtistName(track) { // Join primary artist names safely.
  return (
    track.artists?.primary?.map((artist) => artist.name).filter(Boolean).join(', ') ||
    track.artists?.all?.[0]?.name ||
    'Unknown Artist'
  );
}

function normalizeJioSaavnTrack(track) { // Convert JioSaavn track to Aurix response format.
  const streamUrl = pickBestUrl(track.downloadUrl);

  if (!track?.id || !streamUrl) {
    return null;
  }

  return {
    id: String(track.id),
    title: track.name || track.title || 'Unknown',
    artist: getArtistName(track),
    artwork: pickArtwork(track.image),
    streamUrl,
    duration: Number(track.duration || 0),
    language: String(track.language || '').toLowerCase(),
    source: 'jiosaavn',
  };
}

async function fetchJson(url) { // Fetch JSON with a helpful error when the API fails.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`JioSaavn API failed with ${response.status}`);
  }

  return response.json();
}

function keepTamilAndEnglish(track) { // Keep only Tamil and English songs when language is known.
  return !track.language || ALLOWED_LANGUAGES.has(track.language);
}

async function searchSongs(query, limit = 30) { // Search JioSaavn and return normalized audio results.
  const data = await fetchJson(
    `${JIOSAAVN_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${Math.min(Number(limit) || 30, 50)}`
  );
  const results = data?.data?.results || [];

  return results
    .map(normalizeJioSaavnTrack)
    .filter(Boolean)
    .filter(keepTamilAndEnglish)
    .slice(0, limit);
}

async function getCharts(limit = 30) { // Return Tamil + English chart-style songs.
  const chartQueries = ['tamil hits 2026', 'english hits 2026'];
  const allResults = [];

  for (const query of chartQueries) {
    const results = await searchSongs(query, limit);
    allResults.push(...results);
  }

  const uniqueResults = Array.from(
    new Map(allResults.map((track) => [track.id, track])).values()
  );

  return uniqueResults.slice(0, limit);
}

async function getSongStream(songId) { // Get a fresh direct audio URL for a JioSaavn song ID.
  const data = await fetchJson(`${JIOSAAVN_BASE_URL}/songs/${encodeURIComponent(songId)}`);
  const song = Array.isArray(data?.data) ? data.data[0] : data?.data;
  const normalizedSong = normalizeJioSaavnTrack(song);

  if (!normalizedSong?.streamUrl) {
    throw new Error('Audio stream unavailable for this song.');
  }

  return normalizedSong.streamUrl;
}

async function getSongById(id) { // Keep /song/:id working.
  const data = await fetchJson(`${JIOSAAVN_BASE_URL}/songs/${encodeURIComponent(id)}`);
  const song = Array.isArray(data?.data) ? data.data[0] : data?.data;
  return normalizeJioSaavnTrack(song);
}

module.exports = { searchSongs, getCharts, getSongStream, getSongById };
