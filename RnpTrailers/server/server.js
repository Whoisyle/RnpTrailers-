const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
const serverTrailers = [];

app.get('/api/trailers', (req, res) => {
    res.json(serverTrailers);
});

app.post('/api/trailers', (req, res) => {
    const { name, type, price } = req.body;
    const trailer = { id: Date.now(), name, type, price };
    serverTrailers.push(trailer);
    res.status(201).json(trailer);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 