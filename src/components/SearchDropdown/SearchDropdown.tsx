import React from "react";
import "./SearchDropdown.css";

interface SearchDropdownProps {
  history: string[];
  favorites: string[];
  onSelect: (city: string) => void;
  onClearHistory: () => void;
  visible: boolean;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  history,
  favorites,
  onSelect,
  onClearHistory,
  visible,
}) => {
  if (!visible || (history.length === 0 && favorites.length === 0)) {
    return null;
  }

  return (
    <div className="search-dropdown">
      {favorites.length > 0 && (
        <div className="search-dropdown__section">
          <div className="search-dropdown__section-title">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Избранное
          </div>
          {favorites.map((city) => (
            <button
              key={city}
              className="search-dropdown__item"
              onClick={() => onSelect(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
      {history.length > 0 && (
        <div className="search-dropdown__section">
          <div className="search-dropdown__section-title">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            История
            {history.length > 0 && (
              <button
                className="search-dropdown__clear"
                onClick={onClearHistory}
                title="Очистить историю"
              >
                Очистить
              </button>
            )}
          </div>
          {history.map((city) => (
            <button
              key={city}
              className="search-dropdown__item"
              onClick={() => onSelect(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
