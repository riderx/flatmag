import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LandingPage } from './pages/LandingPage';
import { MagazineList } from './pages/MagazineList';
import { FlatPlan } from './pages/FlatPlan';
import { SharePage } from './pages/SharePage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={
                <>
                  <LandingPage />
                  <Footer />
                </>
              } />
              <Route path="/magazines" element={<MagazineList />} />
              <Route path="/flat-plan/:id" element={<FlatPlan />} />
              <Route path="/share" element={<SharePage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;