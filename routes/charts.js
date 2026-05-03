const express = require('express'); // Import Express so we can create a router.
const router = express.Router(); // Create a small router for chart routes.
const chartsController = require('../controllers/chartsController'); // Import the controller that handles chart logic.

router.get('/charts', chartsController.getCharts); // Run getCharts when someone visits GET /charts.

module.exports = router; // Export this router so index.js can use it.
