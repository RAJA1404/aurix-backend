const express = require('express'); // Import Express so we can create a router.
const router = express.Router(); // Create a small router for search and song routes.
const searchController = require('../controllers/searchController'); // Import the controller that handles search logic.
const jiosaavnService = require('../services/jiosaavn'); // Import the service so this route can refresh YouTube stream URLs.

router.get('/search', searchController.searchSongs); // Run searchSongs when someone visits GET /search.
router.get('/song/:id', searchController.getSongById); // Run getSongById when someone visits GET /song/:id.
router.get('/stream', async (req, res) => { // Create GET /stream?id=VIDEO_ID for refreshing expired YouTube audio URLs.
  try { // Start a try block so errors become JSON responses.
    const id = req.query.id; // Read the YouTube video ID from the URL query.

    if (!id) { // Check if the client forgot to send an id.
      return res.status(400).json({ success: false, message: 'Video id is required' }); // Return a clear bad request response.
    } // End the missing id check.

    const streamUrl = await jiosaavnService.getSongStream(id); // Get a fresh direct audio stream URL for this video ID.

    return res.json({ success: true, streamUrl: streamUrl }); // Return the fresh stream URL to the app.
  } catch (error) { // Catch any stream refresh error.
    return res.status(500).json({ success: false, message: error.message }); // Return a safe JSON error response.
  } // End the try/catch block.
}); // End the stream refresh route.

module.exports = router; // Export this router so index.js can use it.
