import { useState, useRef, useEffect } from "react";
import "./SearchBar.css";

export const SearchBar = ({ onLeagueChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
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

    // Clear selection when typing
    if (selectedLeague) {
      setSelectedLeague(null);
      if (onLeagueChange) {
        onLeagueChange("");
      }
    }
  };

  const handleLeagueSelect = (league) => {
    setSelectedLeague(league);
    setSearchTerm(league.name);
    setIsDropdownOpen(false);

    if (onLeagueChange) {
      onLeagueChange(league.id);
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const clearSelection = () => {
    setSearchTerm("");
    setSelectedLeague(null);
    setIsDropdownOpen(false);

    if (onLeagueChange) {
      onLeagueChange("");
    }
  };

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a league..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
        />

        {searchTerm && (
          <button className="clear-button" onClick={clearSelection}>
            ✕
          </button>
        )}

        {isDropdownOpen && (
          <div className="league-dropdown-list">
            {filteredLeagues.length > 0 ? (
              filteredLeagues.map((league) => (
                <div
                  key={league.id}
                  className="league-dropdown-item"
                  onClick={() => handleLeagueSelect(league)}
                >
                  <span className="league-name">{league.name}</span>
                  <span className="league-country">{league.country}</span>
                </div>
              ))
            ) : (
              <div className="league-dropdown-item no-results">
                No leagues found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
