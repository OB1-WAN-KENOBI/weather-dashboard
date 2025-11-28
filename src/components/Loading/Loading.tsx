import React from "react";
import "./Loading.css";

export const Loading: React.FC = () => {
  return (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__text">Загрузка погоды...</p>
    </div>
  );
};
