import React from 'react';
import '../Styles/MainPage.css';

const MainPage = () => {
  return (
    <div className="main-container">
      <header className="main-header">
        <h1>monkeytype</h1>
        <nav className="nav-links-left">
          <a href="#">KeyBoard</a>
          <a href="#">LeaderBoard</a>
          <a href="#">About</a>
          <a href="#">Settings</a>
        </nav>
        <nav className="nav-links-right">
          <a href="#">Notification</a>
          <a href="#">Profile</a>
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
                <li>15</li>
                <li>30</li>
                <li>60</li>
                <li>120</li>
            </ul>
        </div>
        <section className='Typing-section'>
            <div className='text-area'>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit fugiat aut saepe, nostrum nobis molestias consectetur! Ducimus, laudantium? Ullam nobis ab officiis, tempore illo eveniet.</p>
            </div>
            <div className='type-area'>
                <textarea type="text" placeholder='Start Typing' id="inputText" />
            </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
