require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

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
      return res.status(400).json({
        error:
          "Please provide league paths (e.g., 'europe/europa-league,england/premier-league')",
      });
    }

    console.log("Starting web scraping from livescore.in...");

    // Parse league paths into an array
    const leaguePaths = leagues.split(",").map((path) => path.trim());
    console.log(`Requested leagues: ${leaguePaths.join(", ")}`);

    const allFixtures = [];
    let fixtureId = 1;

    // Fetch data for each league
    for (const leaguePath of leaguePaths) {
      try {
        const url = `https://www.livescore.in/football/${leaguePath}/`;
        console.log(`Fetching from: ${url}`);

        // Fetch the HTML from livescore.in
        const { data } = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        // Load HTML into cheerio
        const $ = cheerio.load(data);

        console.log(
          `HTML loaded for ${leaguePath}, searching for embedded data...`
        );

        // Look for embedded match data in script tags - extract BOTH fixtures and results
        let fixturesData = "";
        let resultsData = "";
        $("script").each((i, elem) => {
          const scriptContent = $(elem).html();
          if (scriptContent) {
            if (scriptContent.includes('initialFeeds["summary-fixtures"]')) {
              const dataMatch = scriptContent.match(/data:\s*`([^`]+)`/);
              if (dataMatch) {
                fixturesData = dataMatch[1];
                console.log(
                  `Found fixtures data in script tag (length: ${fixturesData.length})`
                );
              }
            }
            if (scriptContent.includes('initialFeeds["summary-results"]')) {
              const dataMatch = scriptContent.match(/data:\s*`([^`]+)`/);
              if (dataMatch) {
                resultsData = dataMatch[1];
                console.log(
                  `Found results data in script tag (length: ${resultsData.length})`
                );
              }
            }
          }
        });

        // Combine both data sources
        const matchData = fixturesData + "~" + resultsData;
        
        if (!fixturesData && !resultsData) {
          console.log(`No embedded match data found for ${leaguePath}`);
          continue;
        }

        // Parse the custom format (¬ delimited fields)
        const matches = matchData.split("~");
        console.log(`Found ${matches.length} potential match entries (${fixturesData ? 'fixtures' : ''}${fixturesData && resultsData ? '+' : ''}${resultsData ? 'results' : ''})`);

<<<<<<< HEAD
        // Scrape live match minutes using Puppeteer (only if there are live matches)
        const liveMinuteMap = {};
        const hasLiveMatches = matchData.includes("¬AB÷2¬");

        if (hasLiveMatches) {
          console.log(
            "\n🌐 Launching Puppeteer to scrape live match minutes..."
          );
          try {
            const browser = await puppeteer.launch({
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

            // Wait for match elements to load
            await page
              .waitForSelector(".event__match", { timeout: 5000 })
              .catch(() => {
                console.log("No .event__match elements found");
              });

            // Extract live minutes from rendered page
            const liveMinutes = await page.evaluate(() => {
              const matches = [];
              document.querySelectorAll(".event__match").forEach((match) => {
                const homeTeam = match
                  .querySelector(".event__participant--home")
                  ?.textContent?.trim();
                const awayTeam = match
                  .querySelector(".event__participant--away")
                  ?.textContent?.trim();
                const minuteEl = match.querySelector(".event__stage--block");
                let minute = "";

                if (minuteEl) {
                  // Clone and remove child elements to get just the text
                  const clone = minuteEl.cloneNode(true);
                  Array.from(clone.children).forEach((child) => child.remove());
                  minute = clone.textContent.trim();
                }

                matches.push({
                  homeTeam: homeTeam || "NO_HOME",
                  awayTeam: awayTeam || "NO_AWAY",
                  minute: minute || "NO_MINUTE",
                  hasMinuteEl: !!minuteEl,
                });
              });
              return matches;
            });
=======
        // Also scrape minute data from HTML elements
        const minuteMap = {};
        $(".event__match").each((i, elem) => {
          const $match = $(elem);
          const homeTeamName = $match
            .find(".event__participant--home")
            .text()
            .trim();
          const awayTeamName = $match
            .find(".event__participant--away")
            .text()
            .trim();
          const minuteText = $match
            .find(".event__stage--block")
            .first()
            .text()
            .trim();
>>>>>>> parent of 3894f0e (Merge pull request #14 from GiantbYTES/guy)

            console.log(
              `  📊 Puppeteer found ${liveMinutes.length} match elements:`
            );
            liveMinutes.forEach((m, i) => {
              console.log(
                `    [${i}] ${m.homeTeam} vs ${m.awayTeam} | minute: "${m.minute}" | hasEl: ${m.hasMinuteEl}`
              );
            });

            await browser.close();

            // Store in map
            liveMinutes.forEach((m) => {
              if (
                m.homeTeam !== "NO_HOME" &&
                m.awayTeam !== "NO_AWAY" &&
                m.minute !== "NO_MINUTE"
              ) {
                const key = `${m.homeTeam}-vs-${m.awayTeam}`;
                liveMinuteMap[key] = m.minute.replace(/\s+/g, "");
                console.log(`  ✓ Stored: ${key} = ${liveMinuteMap[key]}'`);
              }
            });

            console.log(
              `🌐 Puppeteer scraping complete. Found ${
                Object.keys(liveMinuteMap).length
              } live matches.\n`
            );
          } catch (error) {
            console.error("Error with Puppeteer:", error.message);
          }
        }

        matches.forEach((matchStr, idx) => {
          try {
            if (!matchStr.includes("AA÷")) return; // Not a match entry

            const fields = {};
            matchStr.split("¬").forEach((field) => {
              if (field.includes("÷")) {
                const [key, value] = field.split("÷");
                fields[key] = value;
              }
            });

            // Extract match information using correct field codes
            // AA = Match ID
            // AE = Home team name
            // AF = Away team name
            // AG = Home score
            // AH = Away score
            // AB = Status (1=scheduled, 2=live, 3=finished)
            // AC = Current minute (this might not be reliable - need to check other fields)
            // BA = Current period/time display
            const matchId = fields["AA"] || `match-${idx}`;
            const homeTeam = fields["AE"] || "";
            const awayTeam = fields["AF"] || "";
            const homeScore = fields["AG"];
            const awayScore = fields["AH"];
            const status = fields["AB"] || "1";
            const minute = fields["AC"];
            const periodTime = fields["BA"]; // This might have the actual minute

            // Log all relevant fields for debugging
            if (homeTeam && awayTeam && status === "2") {
              console.log(`\nDEBUG - Live match found:`);
              console.log(`Teams: ${homeTeam} vs ${awayTeam}`);
              console.log(`ALL FIELDS:`);
              Object.keys(fields)
                .sort()
                .forEach((k) => {
                  console.log(`  ${k}: ${fields[k]}`);
                });
            }

            console.log(
              `Match ${idx}: ${homeTeam} (${
                homeScore || "-"
              }) vs ${awayTeam} (${
                awayScore || "-"
              }) - Status: ${status}, Minute: ${minute || "N/A"}`
            );

            if (!homeTeam || !awayTeam) {
              console.log(`Skipping: missing team names`);
              return;
            }

<<<<<<< HEAD
            // Check if we have minute data from Puppeteer scraping
=======
            // Check if we have minute data from HTML scraping
>>>>>>> parent of 3894f0e (Merge pull request #14 from GiantbYTES/guy)
            const matchKey = `${homeTeam}-vs-${awayTeam}`;
            const scrapedMinute = liveMinuteMap[matchKey];

            // Determine status
            let statusShort = "NS";
            let elapsed = null;
            if (status === "2") {
              // Live match - use Puppeteer scraped minute
              statusShort = "LIVE";

              if (scrapedMinute) {
                elapsed = scrapedMinute;
                console.log(
                  `✓ Using live minute for ${homeTeam} vs ${awayTeam}: ${scrapedMinute}'`
                );
              } else {
                console.log(
                  `✗ No minute found for ${homeTeam} vs ${awayTeam} (matchId: ${matchId})`
                );
              }
            } else if (status === "3") {
              // Finished match
              statusShort = "FT";
            }

            const homeGoals = homeScore ? parseInt(homeScore) : 0;
            const awayGoals = awayScore ? parseInt(awayScore) : 0;

            console.log(
              `Adding fixture: ${homeTeam} ${homeGoals} vs ${awayGoals} ${awayTeam}`
            );

            const leagueName = leaguePath
              .split("/")
              .pop()
              .replace(/-/g, " ")
              .toUpperCase();

            allFixtures.push({
              fixture: {
                id: fixtureId++,
                status: {
                  short: statusShort,
                  elapsed: elapsed,
                },
              },
              league: {
                name: leagueName,
              },
              teams: {
                home: {
                  name: homeTeam,
                  logo: fields["OA"]
                    ? `https://static.flashscore.com/res/image/data/${fields["OA"]}`
                    : "https://via.placeholder.com/40",
                },
                away: {
                  name: awayTeam,
                  logo: fields["OB"]
                    ? `https://static.flashscore.com/res/image/data/${fields["OB"]}`
                    : "https://via.placeholder.com/40",
                },
              },
              goals: {
                home: homeGoals,
                away: awayGoals,
              },
            });
          } catch (error) {
            console.log("Error parsing match entry:", error.message);
          }
        });

        console.log(
          `Finished parsing ${leaguePath}, found ${allFixtures.length} total fixtures so far`
        );
      } catch (error) {
        console.error(`Error fetching league ${leaguePath}:`, error.message);
      }
    }

    console.log(
      `Scraped ${allFixtures.length} fixtures from ${leaguePaths.length} league(s)`
    );

    // Return in API-Football format for compatibility
    res.json({
      response: allFixtures,
    });
  } catch (err) {
    console.error("Error scraping livescore.in:", err);
    res
      .status(500)
      .json({ error: "Failed to scrape data", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
