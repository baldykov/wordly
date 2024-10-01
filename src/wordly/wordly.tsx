import React, { useState } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './App.css';
import { API_TOKEN, WORDS } from './const';

const TARGET_WORD = WORDS[Math.floor(Math.random() * WORDS.length)]; // Случайное слово для игры

type LetterStatus = 'correct' | 'present' | 'absent';

interface Letter {
  char: string;
  status: LetterStatus;
}

const Wordly: React.FC = () => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [keyStatus, setKeyStatus] = useState<{ [key: string]: LetterStatus }>({});
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleInput = (input: string) => {
    if (gameOver) return;

    if (input === '{bksp}') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (input === '{enter}') {
      if (currentGuess.length === 5) {
        validateGuess();
      } else {
        setMessage('Слово должно содержать 5 букв');
      }
    } else if (currentGuess.length < 5 && /^[а-яА-ЯёЁ]$/.test(input)) {
      setCurrentGuess(currentGuess + input.toLowerCase());
    }
  };

  const validateGuess = async () => {
    if (currentGuess.length !== 5) return;

    // Проверяем через API, существует ли введённое слово
    const wordExists = await checkWordExistence(currentGuess);
    if (!wordExists) {
      setMessage('Такого слова нет в словаре!');
      return;
    }

    const newGuess = currentGuess.split('').map((char, index): Letter => {
      if (char === TARGET_WORD[index]) {
        return { char, status: 'correct' };
      } else if (TARGET_WORD.includes(char)) {
        return { char, status: 'present' };
      } else {
        return { char, status: 'absent' };
      }
    });

    const newKeyStatus = { ...keyStatus };
    newGuess.forEach(({ char, status }) => {
      if (newKeyStatus[char] !== 'correct') {
        newKeyStatus[char] = status;
      }
    });

    setKeyStatus(newKeyStatus);
    setGuesses([...guesses, currentGuess]);
    setCurrentGuess('');
    setMessage('');

    if (currentGuess === TARGET_WORD) {
      setGameOver(true);
      setMessage('Вы выиграли!');
    } else if (guesses.length + 1 === 5) {
      setGameOver(true);
      setMessage(`Вы проиграли! Загаданное слово: ${TARGET_WORD}`);
    }
  };

  // Функция для проверки существования слова через API
  const checkWordExistence = async (word: string): Promise<boolean> => {
    try {
      // Пример запроса к API для проверки слова
      const response = await axios.get(`https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=${API_TOKEN}&lang=ru-ru&text=${word}`);
      return response.status === 200;
    } catch (error) {
      return false; // Если слово не найдено
    }
  };

  const getLetterClass = (index: number, char: string): string => {
    if (guesses.length === 0) return '';

    if (TARGET_WORD[index] === char) {
      return 'correct';
    }
    if (TARGET_WORD.includes(char)) {
      return 'present';
    }
    return 'absent';
  };

  return (
    <div className="wordly">
      <h1>Wordly</h1>
      <div className="guesses">
        {guesses.map((guess, i) => (
          <div key={i} className="guess">
            {guess.split('').map((char, index) => (
              <span key={index} className={`letter ${getLetterClass(index, char)}`}>
                {char}
              </span>
            ))}
          </div>
        ))}
        {guesses.length < 5 && !gameOver && (
          <div className="current-guess">
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} className="letter">
                {currentGuess[index] || ''}
              </span>
            ))}
          </div>
        )}
      </div>

      <Keyboard
        onKeyPress={handleInput}
        layout={{
          default: [
            'й ц у к е н г ш щ з х ъ',
            'ф ы в а п р о л д ж э',
            '{enter} я ч с м и т ь б ю {bksp}',
          ],
        }}
        display={{
          '{bksp}': '⌫',
          '{enter}': 'Ввод',
        }}
        buttonTheme={[
          {
            class: 'correct',
            buttons: Object.keys(keyStatus).filter((key) => keyStatus[key] === 'correct').join(' '),
          },
          {
            class: 'present',
            buttons: Object.keys(keyStatus).filter((key) => keyStatus[key] === 'present').join(' '),
          },
          {
            class: 'absent',
            buttons: Object.keys(keyStatus).filter((key) => keyStatus[key] === 'absent').join(' '),
          },
        ]}
      />

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Wordly;
