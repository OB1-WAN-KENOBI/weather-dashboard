import React from "react";
import "./Error.css";

interface ErrorProps {
  message: string;
  onRetry: () => void;
  onManualInput: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  message,
  onRetry,
  onManualInput,
}) => {
  return (
    <div className="error">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="error__icon"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <h3 className="error__title">Ошибка загрузки</h3>
      <p className="error__message">{message}</p>
      <div className="error__actions">
        <button onClick={onRetry} className="error__retry-btn">
          Попробовать снова
        </button>
        <button onClick={onManualInput} className="error__manual-btn">
          Ввести город вручную
        </button>
      </div>
    </div>
  );
};
