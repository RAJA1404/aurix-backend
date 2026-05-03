const jiosaavnService = require('../services/jiosaavn'); // Import the JioSaavn service functions.

async function getCharts(req, res) { // Create an async controller for GET /charts.
  try { // Start a try block so we can catch errors safely.
    const limit = Number(req.query.limit) || 30; // Read the limit from the URL or use 30 by default.
    const results = await jiosaavnService.getCharts(limit); // Ask the service to fetch chart-style songs.

    return res.json({ success: true, query: 'trending', results: results }); // Send the normalized chart results back to the client.
  } catch (error) { // Catch any error that happened above.
    return res.status(500).json({ success: false, message: error.message }); // Send a safe error message to the client.
  } // End the try/catch block.
} // End the getCharts controller.

module.exports = { getCharts }; // Export the controller function.
