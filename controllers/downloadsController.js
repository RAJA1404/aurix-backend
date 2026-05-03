const downloads = []; // Create an in-memory array to store downloaded songs while the server is running.

function saveDownload(req, res) { // Create a controller for POST /downloads.
  const song = req.body; // Read the song data sent in the request body.

  if (!song || !song.id) { // Check if the request body is missing or has no song id.
    return res.status(400).json({ success: false, message: 'Song data with id is required' }); // Send a clear error response.
  } // End the invalid body check.

  const alreadySaved = downloads.find((item) => item.id === song.id); // Look for an existing saved song with the same id.

  if (!alreadySaved) { // Only save the song if it is not already saved.
    downloads.push(song); // Add the song to the in-memory downloads array.
  } // End the duplicate check.

  return res.json({ success: true, message: 'saved' }); // Tell the client the song was saved.
} // End the saveDownload controller.

function getDownloads(req, res) { // Create a controller for GET /downloads.
  return res.json({ success: true, results: downloads }); // Send all saved downloads back to the client.
} // End the getDownloads controller.

function deleteDownload(req, res) { // Create a controller for DELETE /downloads/:id.
  const id = req.params.id; // Read the song id from the URL path.
  const index = downloads.findIndex((song) => song.id === id); // Find the position of the saved song in the array.

  if (index === -1) { // Check if the song was not found.
    return res.status(404).json({ success: false, message: 'Download not found' }); // Send a not found response.
  } // End the missing download check.

  downloads.splice(index, 1); // Remove one song from the downloads array at the found position.

  return res.json({ success: true, message: 'deleted' }); // Tell the client the song was deleted.
} // End the deleteDownload controller.

module.exports = { saveDownload, getDownloads, deleteDownload }; // Export all download controller functions.
