import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Primitives from './pages/Primitives';
import Dangers from './pages/Dangers';
import Scheduling from './pages/Scheduling';
import Scenarios from './pages/Scenarios';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/primitives" element={<Primitives />} />
          <Route path="/dangers" element={<Dangers />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/problems" element={<Scenarios />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
