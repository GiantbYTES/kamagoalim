require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for React frontend
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/fixtures", async (req, res) => {
  try {
    const leagues = req.query.leagues;

    if (!leagues) {
      return res.status(400).json({ error: "Please provide league IDs" });
    }

    // Parse league IDs into an array
    const leagueIds = leagues.split(",").map((id) => id.trim());

    // "1,2,3" => [1,2,3] => [league=1,league=2,league=3] => "league=1&league=2&league=3"
    const leagueQuery = leagueIds.map((id) => `league=${id}`).join("&");

    // Get today's date in YYYY-MM-DD format (ensure UTC)
    const today = new Date().toISOString().split("T")[0];
    console.log(`Fetching fixtures for date: ${today}`);
    console.log(`Requested leagues: ${leagueIds.join(", ")}`);

    // Fetch live fixtures with league filter
    const liveResponse = await fetch(
      `https://v3.football.api-sports.io/fixtures?live=all&${leagueQuery}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }
    );

    const liveData = await liveResponse.json();
    console.log(`Live fixtures: ${liveData.response?.length || 0}`);

    res.json(liveData);
  } catch (err) {
    console.error("Error fetching from API-Football:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
