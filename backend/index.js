/**
 * @file index.js
 * @description
 * This is the backend server for the Hangman web application, built with Express.js.
 * It provides a single API endpoint (`/api/word`) which returns a random word in English or Spanish,
 * depending on the selected language by the user. It uses external APIs to fetch these words.
 *
 * - Environment variables are loaded securely using `dotenv`.
 * - CORS is enabled to allow communication between the frontend and this backend.
 * - API keys are protected from client-side exposure by routing requests through this server.
 *
 * Supported languages:
 * - English: fetched from API Ninjas (requires API key in `NINJAS_API_KEY`)
 * - Spanish: fetched from Free API Database (requires Bearer token in `SPANISH_API_KEY`)
 */

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3001;

// Enable CORS to allow frontend access during development
app.use(cors());

/**
 * GET /api/word
 * 
 * Returns a random word depending on the `lang` query parameter.
 * - ?lang=en -> returns a random English word
 * - ?lang=es -> returns a random Spanish word
 *
 * API responses are forwarded directly to the frontend, where the structure is processed.
 */
app.get('/api/word', async (req, res) => {
  const lang = req.query.lang || "en"; // Default to English if not specified

  try {
    let response;

    if (lang === "en") {
      // Fetch a random English word from API Ninjas
      response = await fetch('https://api.api-ninjas.com/v1/randomword', {
        headers: {
          'X-Api-Key': process.env.NINJAS_API_KEY
        }
      });
    } else {
      // Fetch a list of Spanish words from Free API Database
      response = await fetch(
        'https://www.freeapidatabase.com/View/methodget.php?idTbla=522&idProyect=184',
        {
          headers: {
            Authorization: `Bearer ${process.env.SPANISH_API_KEY}`
          }
        }
      );
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("❌ Error retrieving word:", err);
    res.status(500).json({ error: 'Error retrieving word from external API' });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
