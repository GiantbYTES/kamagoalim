const axios = require("axios");
const cheerio = require("cheerio");

axios
  .get("https://www.livescore.in/football/europe/world-cup/", {
    headers: { "User-Agent": "Mozilla/5.0" },
  })
  .then((r) => {
    const $ = cheerio.load(r.data);

    $("script").each((i, el) => {
      const script = $(el).html();
      if (script && script.includes('initialFeeds["summary-fixtures"]')) {
        const m = script.match(/data:\s*`([^`]+)`/);
        if (m) {
          const matches = m[1].split("~");
          console.log(`Total entries: ${matches.length}\n`);

          // Print first match with team names
          matches.forEach((match, idx) => {
            const fields = {};
            match.split("¬").forEach((f) => {
              if (f && f.includes("÷")) {
                const [key, value] = f.split("÷");
                fields[key] = value;
              }
            });

            // Only show live matches (status 2) with team names
            if (fields["AE"] && fields["AF"] && fields["AB"] === "2") {
              console.log(`\n=== LIVE MATCH ${idx + 1} ===`);
              console.log(`${fields["AE"]} vs ${fields["AF"]}`);
              console.log(`Status (AB): ${fields["AB"]} (2=LIVE)`);
              console.log(`Scores: ${fields["AG"]} - ${fields["AH"]}`);
              console.log(`\nAll fields:`);

              // Show ALL fields sorted
              Object.keys(fields)
                .sort()
                .forEach((key) => {
                  console.log(`  ${key}: ${fields[key]}`);
                });
              console.log("\n" + "=".repeat(50));
            }
          });
        }
      }
    });
  })
  .catch((e) => console.error(e.message));
