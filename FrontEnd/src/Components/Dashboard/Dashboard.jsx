import { useState, useEffect } from "react";
import "./Dashboard.css";
import { SearchBar } from "../SearchBar/SearchBar";

export function Dashboard() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const fetchFixtures = async (leagueIds) => {
    if (!leagueIds || leagueIds.length === 0) {
      setFixtures([]);
      return;
    }

    try {
      // Convert array of IDs to comma-separated string
      const leaguesParam = leagueIds.join(",");
      const response = await fetch(
        `http://localhost:3000/api/fixtures?leagues=${leaguesParam}`
      );
      const data = await response.json();

      console.log("Received fixtures:", data.response?.length);
      console.log(
        "Fixture statuses:",
        data.response?.map((f) => f.fixture.status.short)
      );

      // Sort fixtures: live first, then finished, then scheduled
      const sortedFixtures = (data.response || []).sort((a, b) => {
        const statusA = a.fixture.status.short;
        const statusB = b.fixture.status.short;

        const isLiveA = ["1H", "HT", "2H", "ET", "BT", "P"].includes(statusA);
        const isLiveB = ["1H", "HT", "2H", "ET", "BT", "P"].includes(statusB);
        const isFinishedA = ["FT", "AET", "PEN"].includes(statusA);
        const isFinishedB = ["FT", "AET", "PEN"].includes(statusB);

        if (isLiveA && !isLiveB) return -1;
        if (!isLiveA && isLiveB) return 1;
        if (isFinishedA && !isFinishedB && !isLiveB) return -1;
        if (!isFinishedA && isFinishedB && !isLiveA) return 1;

        return 0;
      });

      setFixtures(sortedFixtures);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    }
  };

  const handleLeagueChange = (leagueIds) => {
    setSelectedLeagues(leagueIds);
  };

  const handleSearch = (leagueIds) => {
    fetchFixtures(leagueIds);
  };

  // Refresh a single fixture
  const handleRefreshFixture = async (fixtureIndex) => {
    if (selectedLeagues.length === 0) return;

    try {
      const leaguesParam = selectedLeagues.join(",");
      const response = await fetch(
        `http://localhost:3000/api/fixtures?leagues=${leaguesParam}`
      );
      const data = await response.json();

      console.log("Refreshing fixture at index:", fixtureIndex);
      console.log("Fresh data received:", data.response?.length, "fixtures");

      const currentFixture = fixtures[fixtureIndex];

      // Find the updated fixture by matching home and away team names
      const updatedFixture = (data.response || []).find(
        (f) =>
          f.teams.home.name === currentFixture.teams.home.name &&
          f.teams.away.name === currentFixture.teams.away.name
      );

      if (updatedFixture) {
        console.log(
          "Found updated fixture:",
          updatedFixture.teams.home.name,
          "vs",
          updatedFixture.teams.away.name
        );
        console.log(
          "Old score:",
          currentFixture.goals.home,
          "-",
          currentFixture.goals.away,
          "Old minute:",
          currentFixture.fixture.status.elapsed
        );
        console.log(
          "New score:",
          updatedFixture.goals.home,
          "-",
          updatedFixture.goals.away,
          "New minute:",
          updatedFixture.fixture.status.elapsed
        );

        // Create a completely new array with updated fixture
        setFixtures((prevFixtures) => {
          const newFixtures = prevFixtures.map((fixture, idx) =>
            idx === fixtureIndex ? updatedFixture : fixture
          );
          console.log("State updated, triggering re-render");
          return newFixtures;
        });
        // Force re-render
        setUpdateTrigger((prev) => prev + 1);
      } else {
        console.log(
          "Could not find matching fixture for:",
          currentFixture.teams.home.name,
          "vs",
          currentFixture.teams.away.name
        );
      }
    } catch (error) {
      console.error("Error refreshing fixture:", error);
    }
  };

  // Calculate total goals from all fixtures
  const totalGoals = fixtures.reduce((sum, fixture) => {
    const homeGoals = fixture.goals.home ?? 0;
    const awayGoals = fixture.goals.away ?? 0;
    return sum + homeGoals + awayGoals;
  }, 0);

  return (
    <div className="Dashboard">
      <SearchBar onLeagueChange={handleLeagueChange} onSearch={handleSearch} />
      {fixtures.length > 0 && (
        <div className="total-goals">Total Goals: {totalGoals}</div>
      )}
      <div className="fixtures-container">
        {fixtures.length > 0 ? (
          fixtures.map((fixture, index) => {
            const status = fixture.fixture.status.short;
            const isLive =
              status === "LIVE" ||
              status === "1H" ||
              status === "HT" ||
              status === "2H" ||
              status === "ET" ||
              status === "BT" ||
              status === "P";
            const isFinished =
              status === "FT" || status === "AET" || status === "PEN";

            return (
              <div
                key={`${fixture.fixture.id}-${updateTrigger}`}
                className="fixture-card"
              >
                <div className="fixture-header">
                  <span className="league-name">{fixture.league.name}</span>
                  <div className="fixture-header-right">
                    <span
                      className={`fixture-status ${
                        isFinished ? "finished" : isLive ? "live" : "scheduled"
                      }`}
                    >
                      {isLive && fixture.fixture.status.elapsed
                        ? `${fixture.fixture.status.elapsed}'`
                        : isFinished
                        ? "FT"
                        : fixture.fixture.status.short}
                    </span>
                    <button
                      className="refresh-button"
                      onClick={() => handleRefreshFixture(index)}
                      title="Refresh this match"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                <div className="match-info">
                  <div className="team home-team">
                    <img
                      src={fixture.teams.home.logo}
                      alt={fixture.teams.home.name}
                      className="team-logo"
                    />
                    <span className="team-name">{fixture.teams.home.name}</span>
                  </div>

                  <div className="score">
                    <span className="score-value">
                      {fixture.goals.home ?? "-"}
                    </span>
                    <span className="score-separator">-</span>
                    <span className="score-value">
                      {fixture.goals.away ?? "-"}
                    </span>
                  </div>

                  <div className="team away-team">
                    <img
                      src={fixture.teams.away.logo}
                      alt={fixture.teams.away.name}
                      className="team-logo"
                    />
                    <span className="team-name">{fixture.teams.away.name}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-fixtures">
            Select leagues and click Search to view fixtures
          </p>
        )}
      </div>
    </div>
  );
}
