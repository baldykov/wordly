import React, { useEffect, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import ReactConfetti from 'react-confetti';
import { Button } from './components/button';

import 'react-simple-keyboard/build/css/index.css';
import './App.css';
import { checkWordExists, getRandomExistsWord } from './utils/words';

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
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [targetWord, setTargetWord] = useState<string>('default');

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
    const wordExists = await checkWordExists(currentGuess);
    if (!wordExists) {
      setMessage('Такого слова нет в словаре!');
      return;
    }

    const newGuess = currentGuess.split('').map((char, index): Letter => {
      if (char === targetWord[index]) {
        return { char, status: 'correct' };
      } else if (targetWord.includes(char)) {
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

    if (currentGuess === targetWord) {
      setGameOver(true);
      setMessage('You win!');
      setGameResult('win');
    } else if (guesses.length + 1 === 5) {
      setGameOver(true);
      setMessage(`You lose! Word is ${targetWord}`);
      setGameResult('lose');
    }
  };


  const getLetterClass = (index: number, char: string): string => {
    if (guesses.length === 0) return '';

    if (targetWord[index] === char) {
      return 'correct';
    }
    if (targetWord.includes(char)) {
      return 'present';
    }
    return 'absent';
  };

  useEffect(() => {
    window?.Telegram?.WebApp.expand();
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleInput('{enter}');
      } else if (event.key === 'Backspace') {
        handleInput('{bksp}');
      } else {
        handleInput(event.key.toUpperCase());
      }
    };
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleInput]);

  const getKeysWithStatus = (status: LetterStatus) => {
    const keys = Object.keys(keyStatus).filter((key) => keyStatus[key] === status);

    return keys.length > 0 ? { class: status, buttons: keys.join(' ') } : null;
  }
  const buttonsStatuses = [
    getKeysWithStatus('correct'),
    getKeysWithStatus('present'),
    getKeysWithStatus('absent'),
  ];
  const buttonTheme = buttonsStatuses.some(item => typeof item === 'object') ? buttonsStatuses : undefined;

  const startNewGame = async () => {
    const targetWord = await getRandomExistsWord();
    if (targetWord) {
      setTargetWord(targetWord);
      setMessage('');
    } else {
      setMessage('Ошибка генерации нового слова');
    }
    setGameOver(false);
    setGameResult(null);
    setCurrentGuess('');
    setGuesses([]);
    setKeyStatus({});
  }

  useEffect(() => {
    startNewGame();
  }, []);
  
  return (
    <div className="layout">
      {gameResult === 'win' && <ReactConfetti numberOfPieces={500} gravity={0.2}/>}
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
                'Ф Ы В А П Р О Л Д Ж Э',
                'Я Ч С М И Т Ь Б Ю {bksp}',
              ],
            }}
            display={{ '{bksp}': '⌫' }}
            theme="hg-theme-default keyboard"
            buttonTheme={buttonTheme}
          />
          {gameOver
            ? <Button label="Начать заново" onClick={startNewGame} />
            : <Button label="Проверить" onClick={() => handleInput('{enter}')} />}
        </div>
      </div>
    </div>
  );
};

export default Wordly;
