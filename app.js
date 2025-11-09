require("dotenv").config();
const express = require("express");
// const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all&league=39&league=140",
      {
        method: "GET",
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching from API-Football:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
