const axios = require("axios");
const cheerio = require("cheerio");

async function testScrape() {
  try {
    const url = "https://www.livescore.in/football/europe/elite-league-u20/";
    console.log(`Fetching from: ${url}\n`);

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    // Look for embedded match data in script tags
    let matchData = "";
    $("script").each((i, elem) => {
      const scriptContent = $(elem).html();
      if (
        scriptContent &&
        (scriptContent.includes('initialFeeds["summary-fixtures"]') ||
          scriptContent.includes('initialFeeds["summary-results"]'))
      ) {
        const dataMatch = scriptContent.match(/data:\s*`([^`]+)`/);
        if (dataMatch) {
          matchData = dataMatch[1];
          console.log(`Found match data (length: ${matchData.length})\n`);
        }
      }
    });

    if (!matchData) {
      console.log("No embedded match data found");
      return;
    }

    // Parse the custom format
    const matches = matchData.split("~");
    console.log(`Found ${matches.length} entries\n`);

    matches.forEach((matchStr, idx) => {
      if (!matchStr.includes("AA÷")) return;

      const fields = {};
      matchStr.split("¬").forEach((field) => {
        if (field.includes("÷")) {
          const [key, value] = field.split("÷");
          fields[key] = value;
        }
      });

      console.log(`\n--- Match ${idx} ---`);
      console.log(`ID: ${fields["AA"]}`);
      console.log(`Home: ${fields["AE"]}`);
      console.log(`Away: ${fields["AF"]}`);
      console.log(`Score: ${fields["AG"]} - ${fields["AH"]}`);
      console.log(`Status: ${fields["AB"]}`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testScrape();
