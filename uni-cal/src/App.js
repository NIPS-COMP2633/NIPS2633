import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing_page/LandingPage';
import MRULogin from './mru_login/MRULogin';
import BookmarkletPage from './outline-calander/outline_cal';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<MRULogin />} />
      <Route path="/bookmarklet" element={<BookmarkletPage />} />
    </Routes>
  );
}

export default App;
