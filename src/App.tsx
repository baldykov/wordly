import React, { useState } from 'react';
import axios from 'axios';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './App.css';
import { API_TOKEN, WORDS } from './const';

const TARGET_WORD = String(WORDS[Math.floor(Math.random() * WORDS.length)]).toUpperCase(); // Случайное слово для игры

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
      setCurrentGuess(currentGuess + input);
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
      
      return response.status === 200 && 'def' in response.data && Array.isArray(response.data.def) && response.data.def.length > 0;
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
    <div className="layout">
      <div className="wordly">
        <h1>WORDLY</h1>
        <div className="game">
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

          <div className="message">{message ?? ''}</div>

          <Keyboard
            onKeyPress={handleInput}
            layout={{
              default: [
                'Й Ц У К Е Н Г Ш Щ З Х Ъ',
                'Ф Ы В А П Р О Л Д Ж Э {bksp}',
                'Я Ч С М И Т Ь Б Ю {enter}',
              ],
            }}
            display={{
              '{bksp}': '⌫',
              '{enter}': 'Ввод',
            }}
            theme="hg-theme-default keyboard"
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
        </div>
      </div>
    </div>
  );
};

export default Wordly;
