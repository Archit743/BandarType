import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/MainPage.css';

const MainPage = () => {
  const [generatedText, setGeneratedText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [textLength, setTextLength] = useState(15);

  // Fetch text from backend
  const getText = async (textLength) => {
    setLoading(true);
    const textData = { textLength };

    try {
      const response = await fetch('https://bandartype-backend.onrender.com/api/text/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('jwt')
        },
        body: JSON.stringify(textData),
      });

      if (response.ok) {
        const data = await response.json();
        data.text = data.text.replace(/\n/g, '').trim().replace(/\.$/, '');
        console.log(data.text)
        setGeneratedText(data.text);
      } else {
        alert('Failed to fetch text');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    }
    setLoading(false);
  };

  useEffect(() => {
    getText(textLength);
  }, [textLength]);

  const handleTyping = (e) => {
    const input = e.key;

    // Handle backspace
    if (input === 'Backspace') {
      setUserInput((prev) => prev.slice(0, -1));
      return;
    }

    // Ignore other control keys
    if (input.length > 1) return;

    // Append new character to input
    setUserInput((prev) => prev + input);

    // Calculate correct characters
    let correctCount = 0;
    for (let i = 0; i < userInput.length + 1; i++) {
      if (generatedText[i] === userInput[i]) {
        correctCount++;
      }
    }
    setCorrectChars(correctCount);
  };

  const renderText = () => {
    return generatedText.split('').map((char, index) => {
      let className = '';

      if (index < userInput.length) {
        className = userInput[index] === char ? 'correct' : 'incorrect';
      } else if (index === userInput.length) {
        className = 'current';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="main-container" onKeyDown={handleTyping} tabIndex={0}>
      <header className="main-header">
        <h1>bandartype</h1>
        <nav className="nav-links-left">
          <Link to="#">KeyBoard</Link>
          <Link to="#">LeaderBoard</Link>
          <Link to="#">About</Link>
          <Link to="#">Settings</Link>
        </nav>
        <nav className="nav-links-right">
          <Link to="#">Notification</Link>
          <Link to="#">Profile</Link>
        </nav>
      </header>
      <main className="main-body">
        <div className="Modes">
          <ul>
            <li>punctuation</li>
            <li>numbers</li>
            <li>|</li>
            <li>time</li>
            <li>words</li>
            <li>quote</li>
            <li>zen</li>
            <li>custom</li>
            <li>|</li>
            <li onClick={() => setTextLength(15)}>15</li>
            <li onClick={() => setTextLength(30)}>30</li>
            <li onClick={() => setTextLength(60)}>60</li>
            <li onClick={() => setTextLength(120)}>120</li>
          </ul>
        </div>

        <section className="Typing-section">
          <div className="text-area">
            {loading ? <p>Loading...</p> : <div className="generated-text">{renderText()}</div>}
          </div>
        </section>

        {/* Feedback */}
        <section className="feedback">
          <p>Correct Characters: {correctChars} / {generatedText.length}</p>
          <p>Accuracy: {(correctChars / generatedText.length * 100).toFixed(2)}%</p>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
