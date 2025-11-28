import React from "react";
import "./Welcome.css";

export const Welcome: React.FC = () => {
  return (
    <div className="welcome">
      <div className="welcome__content">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="welcome__icon"
        >
          <path d="M12 2v20M2 12h20"></path>
        </svg>
        <h2 className="welcome__title">Добро пожаловать!</h2>
        <p className="welcome__text">
          Введите название города или используйте геолокацию для получения
          прогноза погоды
        </p>
      </div>
    </div>
  );
};
