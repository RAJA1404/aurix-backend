const jiosaavnService = require('../services/jiosaavn'); // Import the JioSaavn service functions.

async function searchSongs(req, res) { // Create an async controller for GET /search.
  try { // Start a try block so we can catch errors safely.
    const query = req.query.q; // Read the search text from the URL query named q.
    const limit = Number(req.query.limit) || 30; // Read the limit from the URL or use 30 by default.

    if (!query) { // Check if the user forgot to send a search query.
      return res.status(400).json({ success: false, message: 'Search query is required' }); // Send a clear error response.
    } // End the missing query check.

    const results = await jiosaavnService.searchSongs(query, limit); // Ask the service to search songs from JioSaavn.

    return res.json({ success: true, query: query, results: results }); // Send the normalized song results back to the client.
  } catch (error) { // Catch any error that happened above.
    return res.status(500).json({ success: false, message: error.message }); // Send a safe error message to the client.
  } // End the try/catch block.
} // End the searchSongs controller.

async function getSongById(req, res) { // Create an async controller for GET /song/:id.
  try { // Start a try block so we can catch errors safely.
    const id = req.params.id; // Read the song id from the URL path.

    const song = await jiosaavnService.getSongById(id); // Ask the service to fetch one song by id.

    if (!song) { // Check if no song was found.
      return res.status(404).json({ success: false, message: 'Song not found' }); // Send a not found response.
    } // End the missing song check.

    return res.json({ success: true, result: song }); // Send the single normalized song back to the client.
  } catch (error) { // Catch any error that happened above.
    return res.status(500).json({ success: false, message: error.message }); // Send a safe error message to the client.
  } // End the try/catch block.
} // End the getSongById controller.

module.exports = { searchSongs, getSongById }; // Export both controller functions.
