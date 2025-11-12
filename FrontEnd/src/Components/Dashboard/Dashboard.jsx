import { useState, useEffect } from "react";
import "./Dashboard.css";
import { SearchBar } from "../SearchBar/SearchBar";

export function Dashboard() {
  const [fixtures, setFixtures] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);

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
        <div className="total-goals">
          Total Goals: {totalGoals}
        </div>
      )}
      <div className="fixtures-container">
        {fixtures.length > 0 ? (
          fixtures.map((fixture) => {
            const status = fixture.fixture.status.short;
            const isLive =
              status === "1H" ||
              status === "HT" ||
              status === "2H" ||
              status === "ET" ||
              status === "BT" ||
              status === "P";
            const isFinished =
              status === "FT" || status === "AET" || status === "PEN";

            return (
              <div key={fixture.fixture.id} className="fixture-card">
                <div className="fixture-header">
                  <span className="league-name">{fixture.league.name}</span>
                  <span
                    className={`fixture-status ${
                      isFinished ? "finished" : isLive ? "live" : "scheduled"
                    }`}
                  >
                    {isLive
                      ? `${fixture.fixture.status.elapsed}'`
                      : isFinished
                      ? "FT"
                      : fixture.fixture.status.short}
                  </span>
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
