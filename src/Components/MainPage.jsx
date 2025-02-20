import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/MainPage.css';

const MainPage = () => {
  const [generatedText, setGeneratedText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctChars, setCorrectChars] = useState(0);
  const [loading, setLoading] = useState(false);
  const [textLength, setTextLength] = useState(15);
  const [activeMode, setActiveMode] = useState('words');
  const containerRef = useRef(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const timerRef = useRef(null);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  // Fetch text from backend
  const getText = async (length,mode) => {
    setLoading(true);
    const textData = { textLength: length, mode: mode };

    try {
      const response = await fetch('https://bandartype-backend-1ln2.onrender.com/api/text/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('jwt')
        },
        body: JSON.stringify(textData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove newlines and extra spaces while preserving punctuation
        let processedText = data.text.replace(/\n/g, ' ').trim();
      
        if (mode === 'punctuation') {
          // Ensure existing punctuation is properly formatted
          processedText = processedText.replace(/([.!?])\s+/g, "$1 "); 
      
          // Add missing punctuation if needed
          if (!/[.!?]$/.test(processedText)) {
            processedText += "."; // Ensure text ends with punctuation
          }
      
          // If the text lacks punctuation, insert it at random intervals
          let words = processedText.split(/\s+/);
          let punctuationMarks = ['.', '!', '?'];
          
          for (let i = 6; i < words.length; i += Math.floor(Math.random() * 5) + 5) {
            if (!/[.!?]$/.test(words[i])) { 
              words[i] += punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)];
            }
          }
          
          processedText = words.join(' ');
      
        } else if (mode === 'numbers') {
          // Add numbers at every 5th word
          let words = processedText.split(/\s+/);
          processedText = words.map((word, index) => 
            index % 5 === 0 ? `${Math.floor(Math.random() * 100)} ${word}` : word
          ).join(' ');
        }
        
        setGeneratedText(processedText);
        // Reset typing states when new text is loaded
      setUserInput('');
      setCorrectChars(0);
      setIsCompleted(false);
      setFinalStats(null);
      
      // If in time mode but not started, make sure timer is reset
      if (mode === 'time' && !isTypingActive) {
        setTimeLeft(60);
      }
      } else {
        console.error('Failed to fetch text');
      }
    } catch (error) {
      console.error('An unexpected error occurred', error);
    }
    setLoading(false);
  };

  // Handle mode change
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setUserInput('');
    setCorrectChars(0);
    setIsCompleted(false); // Reset the completion state
  setFinalStats(null);
    if (mode === 'time') {
      startTimer(60); // Default to 60 seconds
      getText(textLength, mode); // Use existing textLength instead of hardcoded 300
    } else if (mode === 'zen') {
      getText(textLength, mode); // Use existing textLength instead of hardcoded 150
    } else {
      getText(textLength, mode);
    }
    
    // Clear any existing timer
    if (timerRef.current && mode !== 'time') {
      clearInterval(timerRef.current);
      setIsTypingActive(false);
    }
  };

  // Handle text length change
  const handleLengthChange = (length) => {
    setTextLength(length);
    setUserInput('');
    setCorrectChars(0);
    // If in time mode, reset the timer
  if (activeMode === 'time') {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(60);
    setIsTypingActive(false);
  }
  
  getText(length, activeMode);
};

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setIsTypingActive(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTypingActive(false);
          completeTyping(userInput, correctChars);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCustomTextSubmit = () => {
    if (customText.trim().length > 0) {
      setGeneratedText(customText);
      setShowCustomInput(false);
    }
  };

// Render custom text input when in custom mode
const renderCustomTextInput = () => {
  return (
    <div className="custom-text-input" onClick={(e) => e.stopPropagation()}>
      <textarea 
        placeholder="Enter your custom text here..." 
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()} // Prevent triggering main keyboard handler
        rows={4}
        autoFocus
      ></textarea>
      <div className="custom-text-actions">
        <button onClick={(e) => {
          e.stopPropagation();
          setShowCustomInput(false);
        }}>Cancel</button>
        <button onClick={(e) => {
          e.stopPropagation();
          handleCustomTextSubmit();
        }}>Use This Text</button>
      </div>
    </div>
  );
};

const completeTyping = (finalInput, correctCount) => {
  // Stop timer if running
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
  
  setIsTypingActive(false);
  setIsCompleted(true);
  
  // Calculate final stats
  const accuracy = (correctCount / Math.max(finalInput.length, 1) * 100).toFixed(2);
  const wordCount = finalInput.split(/\s+/).length;
  const charCount = finalInput.length;
  
  // For time mode, calculate WPM
  let wordsPerMinute = 0;
  if (activeMode === 'time') {
    const minutesElapsed = (60 - timeLeft) / 60;
    wordsPerMinute = Math.round(wordCount / Math.max(minutesElapsed, 0.01));
  } else {
    // For other modes, calculate based on typical reading time
    const estimatedTimeInMinutes = charCount / 200; // Assuming 200 chars per minute is average
    wordsPerMinute = Math.round(wordCount / Math.max(estimatedTimeInMinutes, 0.01));
  }
  
  setFinalStats({
    accuracy,
    wordCount,
    charCount, 
    correctChars: correctCount,
    wpm: wordsPerMinute
  });
};

const restartTyping = () => {
  setUserInput('');
  setCorrectChars(0);
  setIsCompleted(false);
  setFinalStats(null);
  
  if (activeMode === 'time') {
    setTimeLeft(60);
    setIsTypingActive(false);
  }
  
  getText(textLength, activeMode);
};

  useEffect(() => {
    getText(textLength, activeMode);
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    getText(textLength, activeMode);
  }, [textLength, activeMode]); // This avoids redundant calls
  

  // Add auto-focus effect
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [generatedText]); // Refocus when text changes

  useEffect(() => {
    const textArea = document.querySelector('.text-area');
    if (textArea) {
      // Reset scroll position when new text loads
      textArea.scrollTop = 0;
    }
  }, [generatedText]);

  const handleTyping = (e) => {
    if (isCompleted) return;
    const input = e.key;

    // Don't process input if timer is finished in time mode
  if (activeMode === 'time' && timeLeft === 0) return;
  
  // Start time countdown on first keypress for time mode
  if (activeMode === 'time' && !isTypingActive && userInput.length === 0) {
    startTimer(60);
  }

    // Handle backspace
    if (input === 'Backspace') {
      setUserInput((prev) => prev.slice(0, -1));
      return;
    }

    // Ignore other control keys
    if (input.length > 1) return;

    // Create the new user input string (FIXED: using the prev parameter)
  const newInput = userInput + input;

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

    // Check if typing is complete (reached the end of text)
    if (newInput.length >= generatedText.length) {
      completeTyping(newInput, correctCount);
    }
  };

  const renderText = () => {
    if (activeMode === 'zen') {
      // In zen mode, only show correct/current, not errors
      return generatedText.split('').map((char, index) => {
        let className = '';
        
        if (index < userInput.length) {
          className = userInput[index] === char ? 'correct' : '';
        } else if (index === userInput.length) {
          className = 'current';
        }
        
        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      });
    } else {
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
  }
  };

  // Profile component
  const ProfileDropdown = () => {
     // Pause timer when profile opens
  useEffect(() => {
    const prevTimerRef = timerRef.current;
    const wasTypingActive = isTypingActive;
    
    // Pause timer while profile is open
    if (activeMode === 'time' && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Resume timer when profile closes
    return () => {
      if (activeMode === 'time' && wasTypingActive && !timerRef.current) {
        startTimer(timeLeft);
      }
    };
  }, []);
    return (
      <div className="profile-dropdown">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h3>Username</h3>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">75</span>
            <span className="stat-label">WPM</span>
          </div>
          <div className="stat">
            <span className="stat-value">96%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
        <div className="profile-links">
          <Link to="#" className="profile-link">View Stats</Link>
          <Link to="#" className="profile-link">Edit Profile</Link>
          <Link to="#" className="profile-link logout">Log Out</Link>
        </div>
      </div>
    );
  };

  // Settings component
  const SettingsModal = () => {
    // Pause timer when settings open
    useEffect(() => {
      const prevTimerRef = timerRef.current;
      const wasTypingActive = isTypingActive;
      
      // Pause timer while settings are open
      if (activeMode === 'time' && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Resume timer when settings close
      return () => {
        if (activeMode === 'time' && wasTypingActive && !timerRef.current) {
          startTimer(timeLeft);
        }
      };
    }, []);
    return (
      <div className="settings-overlay" onClick={() => setShowSettings(false)}>
        <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
          <div className="settings-header">
            <h2>Settings</h2>
            <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
          </div>
          <div className="settings-content">
            <div className="settings-section">
              <h3>Theme</h3>
              <div className="theme-options">
                <button className="theme-btn active">Dark</button>
                <button className="theme-btn">Light</button>
                <button className="theme-btn">Monokai</button>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Font Size</h3>
              <div className="font-size-control">
                <span className="font-size-label">Small</span>
                <input type="range" min="14" max="28" defaultValue="18" className="font-slider" />
                <span className="font-size-label">Large</span>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Sound Effects</h3>
              <div className="option-with-label">
                <span>Keystroke Sounds</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>Display Options</h3>
              <div className="option-with-label">
                <span>Show WPM Counter</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="option-with-label">
                <span>Show Time Remaining</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="settings-footer">
            <button className="settings-btn cancel-btn" onClick={() => setShowSettings(false)}>Cancel</button>
            <button className="settings-btn save-btn" onClick={() => setShowSettings(false)}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  // Add this useEffect to handle scrolling
  useEffect(() => {
    setTimeout(() => {
      const currentChar = document.querySelector('.current');
      const textArea = document.querySelector('.text-area');
      
      if (currentChar && textArea) {
        // Get the first character element to use as reference for line height
        const firstChar = document.querySelector('.generated-text span:first-child');
        const lineHeight = firstChar ? firstChar.offsetHeight : 0;
        
        const charRect = currentChar.getBoundingClientRect();
        const textAreaRect = textArea.getBoundingClientRect();
        
        // Calculate how many lines down we are
        const firstCharTop = document.querySelector('.generated-text span:first-child').getBoundingClientRect().top;
        const currentCharTop = charRect.top;
        const approxLinesDown = Math.floor((currentCharTop - firstCharTop) / lineHeight);
        
        // Start scrolling after the first line
        if (approxLinesDown > 0) {
          // Scroll to position the current line just below the top of the visible area
          // with some padding for readability
          const targetPosition = textArea.scrollTop + (charRect.top - textAreaRect.top) - (lineHeight * 1.5);
          textArea.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 50);
  }, [userInput]);
  

  return (
    <div className="main-container" onKeyDown={handleTyping} tabIndex={0} ref={containerRef}>
      <header className="main-header">
        <h1>bandartype</h1>
        <nav className="nav-links-left">
        <Link to="#" onClick={() => setShowKeyboard(!showKeyboard)}>KeyBoard</Link>
        <Link to="#">LeaderBoard</Link>
        <Link to="#">About</Link>
        <Link to="#" onClick={() => setShowSettings(!showSettings)}>Settings</Link>
      </nav>
        <nav className="nav-links-right">
          <Link to="#">Notification</Link>
          <div className="profile-container">
            <Link to="#" onClick={() => setShowProfile(!showProfile)}>Profile</Link>
            {showProfile && <ProfileDropdown />}
          </div>
        </nav>
      </header>
      
      <main className="main-body">
        <div className="Modes">
        <ul>
            <li className={activeMode === 'punctuation' ? 'active-mode' : ''} onClick={() => handleModeChange('punctuation')}>punctuation</li>
            <li className={activeMode === 'numbers' ? 'active-mode' : ''} onClick={() => handleModeChange('numbers')}>numbers</li>
            <li>|</li>
            <li className={activeMode === 'time' ? 'active-mode' : ''} onClick={() => handleModeChange('time')}>time</li>
            <li className={activeMode === 'words' ? 'active-mode' : ''} onClick={() => handleModeChange('words')}>words</li>
            <li className={activeMode === 'quote' ? 'active-mode' : ''} onClick={() => handleModeChange('quote')}>quote</li>
            <li className={activeMode === 'zen' ? 'active-mode' : ''} onClick={() => handleModeChange('zen')}>zen</li>
            <li className={activeMode === 'custom' ? 'active-mode' : ''} onClick={() => {
            handleModeChange('custom');
            setShowCustomInput(true);
          }}>custom</li>
            <li>|</li>
            <li className={textLength === 15 ? 'active-mode' : ''} onClick={() => handleLengthChange(15)}>15</li>
            <li className={textLength === 30 ? 'active-mode' : ''} onClick={() => handleLengthChange(30)}>30</li>
            <li className={textLength === 60 ? 'active-mode' : ''} onClick={() => handleLengthChange(60)}>60</li>
            <li className={textLength === 120 ? 'active-mode' : ''} onClick={() => handleLengthChange(120)}>120</li>
          </ul>
        </div>

        {/* Show timer for time mode */}
      {activeMode === 'time' && (
        <div className={`timer-display ${timeLeft <= 10 ? 'warning' : ''}`}>
          {timeLeft}s
        </div>
      )}

{activeMode === 'custom' && showCustomInput && (
  <div className="custom-text-overlay" onClick={(e) => e.stopPropagation()}>
    {renderCustomTextInput()}
  </div>
)}

        {showKeyboard && (
          <div className="keyboard-container">
            <div className="keyboard-row">
          <div className="key">Q</div>
          <div className="key">W</div>
          <div className="key">E</div>
          <div className="key">R</div>
          <div className="key">T</div>
          <div className="key">Y</div>
          <div className="key">U</div>
          <div className="key">I</div>
          <div className="key">O</div>
          <div className="key">P</div>
        </div>
        <div className="keyboard-row">
          <div className="key half-offset">A</div>
          <div className="key">S</div>
          <div className="key">D</div>
          <div className="key">F</div>
          <div className="key">G</div>
          <div className="key">H</div>
          <div className="key">J</div>
          <div className="key">K</div>
          <div className="key">L</div>
        </div>
        <div className="keyboard-row">
          <div className="key full-offset">Z</div>
          <div className="key">X</div>
          <div className="key">C</div>
          <div className="key">V</div>
          <div className="key">B</div>
          <div className="key">N</div>
          <div className="key">M</div>
        </div>
        <div className="keyboard-row">
          <div className="key space-key">SPACE</div>
        </div>
          </div>
        )}

        {/* Add this results overlay when typing is completed */}
          {isCompleted && finalStats && (
          <div className="completion-overlay">
            <div className="results-container">
              <h2>Typing Complete!</h2>
              <div className="results-stats">
                <div className="result-stat">
                  <span className="stat-value">{finalStats.wpm}</span>
                  <span className="stat-label">WPM</span>
                </div>
                <div className="result-stat">
                  <span className="stat-value">{finalStats.accuracy}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="result-stat">
                  <span className="stat-value">{finalStats.correctChars}/{finalStats.charCount}</span>
                  <span className="stat-label">Characters</span>
                </div>
              </div>
              <div className="result-actions">
                <button onClick={restartTyping}>Try Again</button>
                <button onClick={() => handleModeChange(activeMode)}>New Text</button>
              </div>
            </div>
          </div>
          )}

        <section className="Typing-section">
          <div className="text-area">
            {loading ? <p>Loading...</p> : <div className="generated-text">{renderText()}</div>}
          </div>
        </section>

        {/* Feedback */}
        <section className="feedback">
          <p>Correct Characters: {correctChars} / {generatedText.length}</p>
          <p>Accuracy: {generatedText.length > 0 ? (correctChars / userInput.length * 100).toFixed(2) : 0}%</p>
        </section>
      </main>
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default MainPage;
