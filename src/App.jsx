import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import EntryPage from './Components/EntryPage';
import MainPage from './Components/MainPage';

const TestComponent = () => <h1>Hello, World!</h1>;
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPage/>} />
        <Route path="/main" element={<MainPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
