// server.mjs

import express from 'express';
import path from 'path';
const __dirname = path.resolve();
import run from './assets/script.js';
import cors from 'cors';


const app = express();
app.use(cors());

// Serve static files from the 'assets' directory
app.use(express.static(path.join(__dirname, 'assets')));

// Endpoint to handle POST requests
app.use(express.json()); // Parse JSON bodies
app.post('/submit-query', (req, res) => {
  const query = req.body.myinput;
  // Process the query data and perform operations here
  if(query.length != 0 || query!=""){
    const ProcessedData = run(res, query);
  }else{
    res.send("please enter some question to ask")
  }
  
});

// Serve your HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
