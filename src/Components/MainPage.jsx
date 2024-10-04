import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../Styles/MainPage.css';

const fetchTextFromGemini = async (wordCount) => {
  const response = await fetch(`#=${wordCount}`);
  const data = await response.json();
  return data.text;
};

const MainPage = () => {

  const [wordCount, setWordCount] = useState(15);
  const [generatedText, setGeneratedText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const getText = async () => {
      setLoading(true); // Start loading
      try {
        const text = await fetchTextFromGemini(wordCount);
        setGeneratedText(text);
        setUserInput('');
        setCorrectChars(0);
      } catch (error) {
        console.error('Error fetching text:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    getText();
  }, [wordCount]);

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

  return (
    <div className="main-container">
      <header className="main-header">
        <h1>monkeytype</h1>
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
                <li onClick={() => handleModeChange(15)}>15</li>
                <li onClick={() => handleModeChange(30)}>30</li>
                <li onClick={() => handleModeChange(60)}>60</li>
                <li onClick={() => handleModeChange(120)}>120</li>
            </ul>
        </div>
        <section className='Typing-section'>
            <div className='text-area'>
              {loading ? <p>Loading...</p> : <p>{generatedText}</p>} {/* Display loading indicator */}
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
