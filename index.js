const express = require('express'); // Import Express so we can build the API server.
const cors = require('cors'); // Import CORS so browsers can call this API from frontend apps.
const searchRoutes = require('./routes/search'); // Import search and song routes.
const chartsRoutes = require('./routes/charts'); // Import chart routes.
const downloadsRoutes = require('./routes/downloads'); // Import download routes.

const app = express(); // Create the Express app.
const PORT = process.env.PORT || 3000; // Use the host-provided port online, fallback to 3000 locally.

app.use(cors()); // Allow frontend apps to call this API.
app.use(express.json()); // Allow Express to read JSON request bodies.

app.get('/', (req, res) => { // Create the home route for GET /.
  res.json({ success: true, message: 'Aurix Backend API is running' }); // Send a simple success message.
}); // End the home route.

app.use(searchRoutes); // Register /search and /song/:id routes.
app.use(chartsRoutes); // Register /charts routes.
app.use(downloadsRoutes); // Register /downloads routes.

async function startServer() { // Start dependencies before accepting requests.
  try { // Catch startup failures so they are visible in the terminal.
    app.listen(PORT, () => { // Start the server and run this function when it is ready.
      console.log(`Aurix Backend API running at http://localhost:${PORT}`); // Show the local server URL.
      console.log('Available routes:'); // Print a heading for the route list.
      console.log('GET    /'); // Show the home route.
      console.log('GET    /search?q=QUERY&limit=30'); // Show the search route.
      console.log('GET    /charts?limit=30'); // Show the charts route.
      console.log('GET    /song/:id'); // Show the single song route.
      console.log('POST   /downloads'); // Show the save download route.
      console.log('GET    /downloads'); // Show the list downloads route.
      console.log('DELETE /downloads/:id'); // Show the delete download route.
    }); // End the server startup code.
  } catch (error) { // Catch initialization errors.
    console.error('Failed to start Aurix Backend API:', error); // Print the startup failure.
    process.exit(1); // Exit with failure so the issue is obvious.
  } // End the try/catch block.
} // End startServer.

startServer(); // Start the API.
