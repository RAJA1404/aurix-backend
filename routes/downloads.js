const express = require('express'); // Import Express so we can create a router.
const router = express.Router(); // Create a small router for download routes.
const downloadsController = require('../controllers/downloadsController'); // Import the controller that handles download logic.

router.post('/downloads', downloadsController.saveDownload); // Run saveDownload when someone sends POST /downloads.
router.get('/downloads', downloadsController.getDownloads); // Run getDownloads when someone visits GET /downloads.
router.delete('/downloads/:id', downloadsController.deleteDownload); // Run deleteDownload when someone visits DELETE /downloads/:id.

module.exports = router; // Export this router so index.js can use it.
