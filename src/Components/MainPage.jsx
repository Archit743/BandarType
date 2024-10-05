import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../Styles/MainPage.css';


const MainPage = () => {


  const [generatedText, setGeneratedText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [loading, setLoading] = useState(false);

  const getText = async (textLength) => {
    setLoading(true)
    const textData = {
      textLength: textLength
    };

    try {
      const response = await fetch('https://bandartype-backend.onrender.com/api/text/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('jwt')
        },
        body: JSON.stringify(textData),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to fetch text', data);
        alert('text fetching failure' + (data.message || 'Unknown error'));
      } else {
        const data = await response.json();
        setGeneratedText(data.text);

      }
    } catch (error) {
      console.error('Fetch Error: ', error);
      alert('An unexpected error occurred');
    }
    setLoading(false)
  };
  useEffect(() => {
    getText(15);
  }, []);
  // Compare user input with generated text
  const handleTyping = (e) => {
    const input = e.target.value;
    setUserInput(input);

    let correctCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === generatedText[i]) {
        correctCount++;
      }
    }
    setCorrectChars(correctCount);
  };

  const renderText = (text) => {
    return (
      <div className='text-wrapper'>
        {text.split(' ').map((word, wordIndex) => (
          <div className='word' key={wordIndex}>
            {word.split('').map((char, charIndex) => (
              <span className='char' key={charIndex}>
                {char}
              </span>
            ))}</div>
        ))}
      </div>
    )

  }

  return (
    <div className="main-container">
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
        <div className='Modes'>
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
            <li onClick={() => getText(15)}>15</li>
            <li onClick={() => getText(30)}>30</li>
            <li onClick={() => getText(60)}>60</li>
            <li onClick={() => getText(120)}>120</li>
          </ul>
        </div>
        <section className='Typing-section'>
          <div className='text-area'>
            {loading ? <p>Loading...</p> : <p>{renderText(generatedText)}</p>} {/* Display loading indicator */}
          </div>
          <div className='type-area'>
            <textarea type="text" placeholder='Start Typing' value={userInput} onChange={handleTyping} id="inputText" />
          </div>
        </section>
        {/* Feedback */}
        <section className='feedback'>
          <p>Correct Characters: {correctChars} / {generatedText.length}</p>
          <p>Accuracy: {(correctChars / generatedText.length * 100).toFixed(2)}%</p>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
