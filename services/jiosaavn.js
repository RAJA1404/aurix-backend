const { google } = require('googleapis'); // Import the official Google APIs client.
const ytdl = require('@distube/ytdl-core'); // Import YouTube audio stream helper.

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // YouTube Data API v3 key from hosting environment.

if (!YOUTUBE_API_KEY) { // Fail fast if the API key is missing.
  throw new Error('YOUTUBE_API_KEY environment variable is required.');
} // End missing API key check.
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY }); // Create a YouTube Data API client.

function getThumbnail(snippet) { // Read the best available thumbnail URL from the YouTube snippet.
  return snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '';
} // End getThumbnail.

function normalizeYouTubeVideo(item) { // Convert one YouTube API search result into the existing Aurix response format.
  const videoId = item?.id?.videoId || ''; // Read the YouTube video ID.
  const snippet = item?.snippet || {}; // Read the snippet safely.

  if (!videoId) { // Skip results that do not contain a video ID.
    return null; // Return null so callers can filter it out.
  } // End missing video ID check.

  return { // Return the same shape the controllers already expect.
    id: String(videoId), // YouTube video ID.
    title: snippet.title || '', // Video title.
    artist: snippet.channelTitle || 'Unknown', // Channel title as artist.
    artwork: getThumbnail(snippet), // YouTube thumbnail URL.
    streamUrl: `https://www.youtube.com/watch?v=${videoId}`, // YouTube watch URL for iframe player.
    duration: 0, // Duration requires an extra videos.list call, so keep 0 for now.
    source: 'youtube', // Mark this result as coming from YouTube.
  }; // End normalized video object.
} // End normalizeYouTubeVideo.

async function searchYouTubeVideos(query, limit = 30) { // Search YouTube Music-category videos with the official API.
  const response = await youtube.search.list({ // Call the YouTube Data API v3 search endpoint.
    part: ['snippet'], // Request snippet data.
    q: `${query} song`, // Search for songs matching the user's query.
    type: ['video'], // Return videos only.
    videoCategoryId: '10', // Music category.
    maxResults: Math.min(Number(limit) || 30, 50), // YouTube API allows up to 50 results per request.
  }); // End API call.

  const items = response.data.items || []; // Read returned search items.

  return items.map(normalizeYouTubeVideo).filter(Boolean).slice(0, limit); // Normalize and limit results.
} // End searchYouTubeVideos.

async function searchSongs(query, limit = 30) { // Search YouTube and return normalized full-song results.
  return searchYouTubeVideos(query, limit); // Return normalized YouTube song results.
} // End searchSongs.

async function getCharts(limit = 30) { // Return chart-style YouTube Music songs.
  return searchYouTubeVideos('tamil hits 2024 songs', limit); // Search for Tamil hit songs.
} // End getCharts.

async function getSongStream(videoId) { // Return a YouTube watch URL for iframe playback.
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`; // Build the YouTube video URL.
  const info = await ytdl.getInfo(videoUrl); // Fetch playable formats for this video.
  const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' }); // Pick best audio-only format.

  if (!format?.url) { // Ensure a playable audio URL exists.
    throw new Error('Audio stream unavailable for this song.');
  } // End missing audio format check.

  return format.url; // Return direct audio stream URL for TrackPlayer.
} // End getSongStream.

async function getSongById(id) { // Keep the existing /song/:id controller working.
  const streamUrl = await getSongStream(id); // Build the YouTube watch URL for the given video ID.

  return { // Return the same normalized object shape.
    id: String(id), // YouTube video ID.
    title: '', // Title is unavailable without an extra API call.
    artist: 'Unknown', // Artist is unavailable without an extra API call.
    artwork: '', // Artwork is unavailable without an extra API call.
    streamUrl: streamUrl, // YouTube watch URL.
    duration: 0, // Duration is skipped for now.
    source: 'youtube', // Mark this result as coming from YouTube.
  }; // End normalized song object.
} // End getSongById.

module.exports = { searchSongs, getCharts, getSongStream, getSongById }; // Export functions used by routes and controllers.
