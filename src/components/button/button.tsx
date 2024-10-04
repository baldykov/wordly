import React from 'react';

import './button.css';

interface Props {
  label: string;  // Текст на кнопке
  onClick: () => void;  // Функция, которая вызывается при нажатии
}

export const Button: React.FC<Props> = ({ label, onClick }) => {
  return (
    <button className="game-button" onClick={onClick}>
      {label}
    </button>
  );
};

