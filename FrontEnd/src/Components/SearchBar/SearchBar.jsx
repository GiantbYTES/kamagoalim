import { useState, useRef, useEffect } from "react";
import "./SearchBar.css";

export const SearchBar = ({ onLeagueChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const dropdownRef = useRef(null);

  const leagues = [
    { id: 140, name: "La Liga", country: "Spain" },
    { id: 39, name: "Premier League", country: "England" },
    { id: 61, name: "Ligue 1", country: "France" },
    { id: 78, name: "Bundesliga", country: "Germany" },
    { id: 135, name: "Serie A", country: "Italy" },
    { id: 2, name: "UEFA Champions League", country: "World" },
    { id: 3, name: "UEFA Europa League", country: "World" },
    { id: 848, name: "UEFA Europa Conference League", country: "World" },
  ];

  // Filter leagues based on search term
  const filteredLeagues = leagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
  };

  const handleLeagueSelect = (league) => {
    // Check if league is already selected
    if (!selectedLeagues.find((l) => l.id === league.id)) {
      const newSelectedLeagues = [...selectedLeagues, league];
      setSelectedLeagues(newSelectedLeagues);

      if (onLeagueChange) {
        onLeagueChange(newSelectedLeagues.map((l) => l.id));
      }
    }

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const removeLeague = (leagueId) => {
    const newSelectedLeagues = selectedLeagues.filter((l) => l.id !== leagueId);
    setSelectedLeagues(newSelectedLeagues);

    if (onLeagueChange) {
      onLeagueChange(newSelectedLeagues.map((l) => l.id));
    }
  };

  const clearAllSelections = () => {
    setSelectedLeagues([]);
    setSearchTerm("");
    setIsDropdownOpen(false);

    if (onLeagueChange) {
      onLeagueChange([]);
    }
  };

  const handleSearchClick = () => {
    if (selectedLeagues.length > 0) {
      // Trigger the search action when button is clicked
      console.log("Searching for leagues:", selectedLeagues);
    }
  };

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a league..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
          />
          {(searchTerm || selectedLeagues.length > 0) && (
            <button
              className="clear-input-button"
              onClick={clearAllSelections}
              aria-label="Clear all"
            >
              ✕
            </button>
          )}
        </div>

        <button className="search-button" onClick={handleSearchClick}>
          Search
        </button>

        {isDropdownOpen && (
          <div className="league-dropdown-list">
            {filteredLeagues.length > 0 ? (
              filteredLeagues.map((league) => {
                const isSelected = selectedLeagues.find(
                  (l) => l.id === league.id
                );
                return (
                  <div
                    key={league.id}
                    className={`league-dropdown-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleLeagueSelect(league)}
                  >
                    <span className="league-name">{league.name}</span>
                    <span className="league-country">{league.country}</span>
                  </div>
                );
              })
            ) : (
              <div className="league-dropdown-item no-results">
                No leagues found
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLeagues.length > 0 && (
        <div className="selected-leagues">
          {selectedLeagues.map((league) => (
            <div key={league.id} className="selected-league-tag">
              <span className="selected-league-name">{league.name}</span>
              <button
                className="remove-league-button"
                onClick={() => removeLeague(league.id)}
                aria-label={`Remove ${league.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
