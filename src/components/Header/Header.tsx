import React, { useState, useRef, useEffect } from "react";
import type { TemperatureUnit } from "../../types";
import { SearchDropdown } from "../SearchDropdown";
import "./Header.css";

interface HeaderProps {
  cityInput: string;
  onCityInputChange: (value: string) => void;
  onSearch: () => void;
  onLocationClick: () => void;
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  searchHistory: string[];
  favorites: string[];
  onSelectCity: (city: string) => void;
  onClearHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cityInput,
  onCityInputChange,
  onSearch,
  onLocationClick,
  unit,
  onUnitChange,
  theme,
  onThemeToggle,
  searchHistory,
  favorites,
  onSelectCity,
  onClearHistory,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    if (searchHistory.length > 0 || favorites.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSelectCity = (city: string) => {
    onSelectCity(city);
    setShowDropdown(false);
  };

  return (
    <header className="header">
      <h1 className="header__title">Weather Dashboard</h1>
      <div className="header__controls">
        <div className="header__search-container" ref={searchContainerRef}>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              onCityInputChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={handleInputFocus}
            onKeyPress={handleKeyPress}
            placeholder="Введите город..."
            className="header__input"
          />
          <button
            onClick={onSearch}
            className="header__search-btn"
            aria-label="Поиск"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          <SearchDropdown
            history={searchHistory}
            favorites={favorites}
            onSelect={handleSelectCity}
            onClearHistory={onClearHistory}
            visible={showDropdown}
          />
        </div>
        <button
          onClick={onLocationClick}
          className="header__location-btn"
          title="Мое местоположение"
          aria-label="Определить местоположение"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
            <circle cx="12" cy="9" r="2.5"></circle>
          </svg>
        </button>
        <div className="header__unit-toggle">
          <button
            onClick={() => onUnitChange("celsius")}
            className={`header__unit-btn ${
              unit === "celsius" ? "header__unit-btn--active" : ""
            }`}
            data-unit="celsius"
          >
            °C
          </button>
          <button
            onClick={() => onUnitChange("fahrenheit")}
            className={`header__unit-btn ${
              unit === "fahrenheit" ? "header__unit-btn--active" : ""
            }`}
            data-unit="fahrenheit"
          >
            °F
          </button>
        </div>
        <button
          onClick={onThemeToggle}
          className="header__theme-toggle"
          title={
            theme === "light"
              ? "Переключить на темную тему"
              : "Переключить на светлую тему"
          }
          aria-label="Переключить тему"
        >
          {theme === "light" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
